const fastify = require('fastify')({ logger: true });

// In-memory data store
let items = [];

// Declare routes

// Create
fastify.post('/items', async (request, reply) => {
    const item = request.body;
    items.push(item);
    return item;
});

// Read all
fastify.get('/tin-tuc', async (request, reply) => {
    return {message: 'hello world', items};
});

// Read one
fastify.get('/items/:id', async (request, reply) => {
    const id = request.params.id;
    const item = items.find(i => i.id === id);
    if (item) {
        return item;
    } else {
        reply.status(404).send({ message: 'Item not found' });
    }
});

// Update
fastify.put('/items/:id', async (request, reply) => {
    const id = request.params.id;
    const updatedItem = request.body;
    let index = items.findIndex(i => i.id === id);
    if (index !== -1) {
        items[index] = updatedItem;
        return updatedItem;
    } else {
        reply.status(404).send({ message: 'Item not found' });
    }
});

// Delete
fastify.delete('/items/:id', async (request, reply) => {
    const id = request.params.id;
    let index = items.findIndex(i => i.id === id);
    if (index !== -1) {
        items.splice(index, 1);
        return { message: 'Item deleted' };
    } else {
        reply.status(404).send({ message: 'Item not found' });
    }
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();