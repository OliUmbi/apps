import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanstackQuery from './query/provider'

import { routeTree } from './routeTree.gen'

export const getRouter = () => {
    const queryContext = TanstackQuery.getContext()

    const router = createRouter({
        routeTree,
        context: {
            ...queryContext,
        },

        defaultPreload: 'intent',
    })

    setupRouterSsrQueryIntegration({ router, queryClient: queryContext.queryClient })

    return router
}
