export function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'У вас нет прав для просмотра этой страницы' });
        }

        next();
    };
}