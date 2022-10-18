import Redis from 'ioredis';

const redisClient = new Redis(String(process.env.REDIS_URL));

/*// if no connection, an error will be emitted
// handle connection errors
redisClient
	.connect()
	.then(() => console.log('Connected to redis DB!'))
	.catch(err => console.error(err));*/

export default redisClient;