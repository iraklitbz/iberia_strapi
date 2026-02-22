import { factories } from '@strapi/strapi'

function getAcceso(user: any): string[] {
  const levels = ['publico']
  if (!user) return levels
  levels.push('miembros')
  if (user.role?.name === 'Suscriptor') levels.push('suscriptores')
  return levels
}

export default factories.createCoreController('api::georgian.georgian', ({ strapi }) => ({
  async find(ctx) {
    const allowed = getAcceso(ctx.state.user)
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters as object ?? {}),
        $or: [
          { acceso: { $in: allowed } },
          { acceso: { $null: true } },
        ],
      },
    }
    return super.find(ctx)
  },

  async findOne(ctx) {
    const response = await super.findOne(ctx)
    if (!response?.data) return response
    const allowed = getAcceso(ctx.state.user)
    const nivel = response.data.acceso ?? 'publico'
    if (!allowed.includes(nivel)) return ctx.forbidden('Acceso restringido')
    return response
  },
}))
