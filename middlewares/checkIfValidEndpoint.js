module.exports = function (memoryCache, EndpointCollection) {
    return async function (request, response, next) {
        const params = request.params
        const cacheKey = `${params.clientId}_${params.endpoint}`;
        const endpointInCache = await memoryCache.get(cacheKey);
        if (!endpointInCache) {
            let endpoint = await EndpointCollection.findOne({
                clientId: params.clientId,
                endpoint: params.endpoint
            }, { schema: 0, endpoint: 0, clientId: 0, __v: 0 }, { limit: 1 })

            if (!endpoint) {
                return response.status(404).json({ message: "Not found endpoint." })
            }

            await memoryCache.set(cacheKey, true, (60 * 1000))
        }
        next();
    }
}