const Ziggy = {
    url: 'http://127.0.0.1:8000',
    port: null,
    defaults: {},
    routes: {
        'login': {
            uri: 'login',
            methods: ['GET', 'HEAD']
        },
        'logout': {
            uri: 'logout',
            methods: ['POST']
        },
        'dashboard.admin': {
            uri: 'dashboard/admin',
            methods: ['GET', 'HEAD']
        },
        'admin.users.index': {
            uri: 'dashboard/admin/users',
            methods: ['GET', 'HEAD']
        },
        'admin.users.store': {
            uri: 'dashboard/admin/users',
            methods: ['POST']
        },
        'admin.users.update': {
            uri: 'dashboard/admin/users/{user}',
            methods: ['PUT', 'PATCH'],
            parameters: ['user']
        },
        'admin.users.destroy': {
            uri: 'dashboard/admin/users/{user}',
            methods: ['DELETE'],
            parameters: ['user']
        },
        'admin.offices.index': {
            uri: 'dashboard/admin/offices',
            methods: ['GET', 'HEAD']
        },
        'admin.offices.store': {
            uri: 'dashboard/admin/offices',
            methods: ['POST']
        },
        'admin.offices.update': {
            uri: 'dashboard/admin/offices/{office}',
            methods: ['PUT', 'PATCH'],
            parameters: ['office']
        },
        'admin.offices.destroy': {
            uri: 'dashboard/admin/offices/{office}',
            methods: ['DELETE'],
            parameters: ['office']
        },
        'admin.announcements.index': {
            uri: 'dashboard/admin/announcements',
            methods: ['GET', 'HEAD']
        },
        'admin.announcements.store': {
            uri: 'dashboard/admin/announcements',
            methods: ['POST']
        },
        'admin.announcements.update': {
            uri: 'dashboard/admin/announcements/{announcement}',
            methods: ['PUT', 'PATCH'],
            parameters: ['announcement']
        },
        'admin.announcements.destroy': {
            uri: 'dashboard/admin/announcements/{announcement}',
            methods: ['DELETE'],
            parameters: ['announcement']
        },
        'api.announcements': {
            uri: 'api/announcements',
            methods: ['GET', 'HEAD']
        }
    }
};

export { Ziggy };
export default Ziggy;
