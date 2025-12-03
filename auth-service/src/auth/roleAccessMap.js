// method:/path
const RoleAccessMap = {
  "POST:/admin/:users": ["ADMIN"],
};

export const getRoutePermission = (req) => {
  try {
    const method = req.method?.toUpperCase();
    const routePath = req.route?.path || req.path || req.originalUrl;

    if (!method || !routePath) return null;

    const key = `${method}:${routePath}`;
    return RoleAccessMap[key] || null;
  } catch (err) {
    // Prevent crash entirely
    return null;
  }
};
