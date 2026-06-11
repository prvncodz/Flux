class ApiError extends Error {
    statusCode: number;
    data: null;
    errors: unknown[];
    success: boolean;

    constructor(
        statusCode: number,
        message = "something went wrong",
        errors: unknown[] = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.errors = errors;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
