import { HttpCode } from './constants';

interface AppErrorArgs {
	name?: string;
	httpCode: HttpCode;
	message: string;
	isNormal?: boolean;
}

export class AppError extends Error {
	public readonly name: string;
	public readonly httpCode: HttpCode;
	public readonly isNormal: boolean = true;

	constructor(args: AppErrorArgs) {
		super(args.message);

		Object.setPrototypeOf(this, new.target.prototype);

		this.name = args.name || 'Error';
		this.httpCode = args.httpCode;

		if (args.isNormal !== undefined) {
			this.isNormal = args.isNormal;
		}

		Error.captureStackTrace(this);
	}
}