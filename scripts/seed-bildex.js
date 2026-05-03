'use strict';

async function seedBildex() {
  console.log('Seeding Bildex data...');

  // Set public role permissions for all Bildex collections
  await setPublicPermissions({
    'bildex-category': ['find', 'findOne'],
    'bildex': ['find', 'findOne'],
    'bildex-georgian-category': ['find', 'findOne'],
    'bildex-georgian': ['find', 'findOne'],
  });

  // Seed Bildex Category: News
  await upsertCategory('bildex-category', { name: 'News', slug: 'news' });

  // Seed Bildex Georgian Category: News
  await upsertCategory('bildex-georgian-category', { name: 'News', slug: 'news' });

  console.log('Bildex seed complete.');
}

async function setPublicPermissions(permissionsMap) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  for (const [controller, actions] of Object.entries(permissionsMap)) {
    for (const action of actions) {
      const actionKey = `api::${controller}.${controller}.${action}`;
      const exists = await strapi.query('plugin::users-permissions.permission').findOne({
        where: { action: actionKey, role: publicRole.id },
      });
      if (!exists) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action: actionKey, role: publicRole.id },
        });
        console.log(`  + permission: ${actionKey}`);
      } else {
        console.log(`  = permission already set: ${actionKey}`);
      }
    }
  }
}

async function upsertCategory(model, data) {
  const existing = await strapi.documents(`api::${model}.${model}`).findFirst({
    filters: { slug: data.slug },
  });
  if (!existing) {
    await strapi.documents(`api::${model}.${model}`).create({ data });
    console.log(`  + created ${model}: ${data.name}`);
  } else {
    console.log(`  = ${model} already exists: ${data.name}`);
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  await seedBildex();
  await app.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
