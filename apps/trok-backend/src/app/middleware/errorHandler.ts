import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, req , res, next) => {
	console.log(error)
	return res.status(error.status || 500).json({
		error: {
			message: error.message || "Something went wrong."
		}
	})
}