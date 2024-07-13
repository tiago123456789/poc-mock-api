require('dotenv').config()
const express = require("express")
const { rateLimit } = require('express-rate-limit');
const { faker } = require('@faker-js/faker');
require("./configs/database")
let cache = require("./configs/cache")
const app = express();

const ClientCollection = require("./collections/client")
const EndpointCollection = require("./collections/endpoint");
const EndpointDataCollection = require("./collections/endpointData");
const checkIfValidEndpoint = require("./middlewares/checkIfValidEndpoint");

app.use(rateLimit({
    windowMs: 1 * 1000,
    limit: 1,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}))

app.use(express.json())

function startRoutes() {
    app.post("/clients", async (request, response) => {
        const clientCollecton = new ClientCollection();
        const clientCreated = await clientCollecton.save();
        return response.status(201).json({
            clientId: clientCreated._id
        })
    })

    app.post("/clients/:clientId/resources", async (request, response) => {
        const data = request.body

        const client = await ClientCollection.findById(request.params.clientId)
        if (!client) {
            return response.status(404).json({
                message: "ClientId not found"
            })
        }

        const newEndpoint = {
            clientId: request.params.clientId,
            endpoint: data.endpoint
        }

        newEndpoint.schema = data.schema
        const endpointCollection = new EndpointCollection(newEndpoint)
        const endpointCreated = await endpointCollection.save()
        response.json(endpointCreated)
    })

    app.post("/:clientId/api/:endpoint", checkIfValidEndpoint(cache, EndpointCollection), async (request, response) => {
        const params = request.params;

        let endpoint = await EndpointCollection.find({
            clientId: params.clientId,
            endpoint: params.endpoint
        })

        if (endpoint.length === 0) {
            return response.status(404).json({ message: "Not found endpoint." })
        }

        endpoint = endpoint[0]
        const item = {}
        for (let index = 0; index < endpoint.schema.length; index += 1) {
            const schema = endpoint.schema[index]
            const [method1, method2] = schema[1].split(".")
            const fakeMethod = faker[method1]
            let value = schema[1]
            if (fakeMethod) {
                value = fakeMethod[method2]()
            }
            item[schema[0]] = value

        }

        item.clientId = params.clientId;
        item.endpoint = params.endpoint;

        const endpointDataCollection = new EndpointDataCollection(item)
        await endpointDataCollection.save()

        delete item.clientId;
        delete item.endpoint;
        response.json(item)
    })

    app.get("/:clientId/api/:endpoint", checkIfValidEndpoint(cache, EndpointCollection), async (request, response) => {
        const params = request.params
        const data = await EndpointDataCollection.find(
            {
                clientId: params.clientId,
                endpoint: params.endpoint
            },
            { clientId: 0, endpoint: 0, __v: 0 },
            { limit: 10, offset: 0 }
        )
        response.json(data)
    })

    app.get("/:clientId/api/:endpoint/:id", checkIfValidEndpoint(cache, EndpointCollection), async (request, response) => {
        const params = request.params

        const data = await EndpointDataCollection.findById(params.id,
            { clientId: 0, endpoint: 0, __v: 0 },
            { limit: 10, offset: 0 }
        )

        if (!data) {
            return response.status(404).json({ message: "Not found register." })
        }

        response.json(data)
    })

    app.delete("/:clientId/api/:endpoint/:id", checkIfValidEndpoint(cache, EndpointCollection), async (request, response) => {
        const params = request.params

        await EndpointDataCollection.deleteOne({
            _id: params.id,
        })

        response.sendStatus(204);
    })

    app.put("/:clientId/api/:endpoint/:id", checkIfValidEndpoint(cache, EndpointCollection), async (request, response) => {
        const params = request.params;
        const body = request.body;

        await EndpointDataCollection.findOneAndUpdate({
            _id: params.id,
        }, body)

        response.sendStatus(204);
    })
}

app.listen(5000, async () => {
    cache = await cache.start();
    startRoutes()
    console.log("Server is running at port 5000")
})
