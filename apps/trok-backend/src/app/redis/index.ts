import Redis from 'ioredis';

const isDevelopment = process.env.NODE_ENV !== 'production';
/*const options = isDevelopment ? {
	password: process.env.REDIS_PASSWORD,
	username: 'default'
}*/

const redisClient = new Redis(Number(process.env.REDIS_PORT), String(process.env.REDIS_HOST), {
	password: process.env.REDIS_PASSWORD,
	username: process.env.REDIS_USERNAME
});

/*// if no connection, an error will be emitted
// handle connection errors
redisClient
	.connect()
	.then(() => console.log('Connected to redis DB!'))
	.catch(err => console.error(err));*/

export default redisClient;