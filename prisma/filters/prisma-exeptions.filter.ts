import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.code) {
      case 'P2000':
        // "The provided value for the column is too long for the column's type"
        status = HttpStatus.BAD_REQUEST;
        message = 'The provided value is too long for the database field';
        break;

      case 'P2001':
        // "The record searched for in the where condition does not exist"
        status = HttpStatus.NOT_FOUND;
        message = 'The requested record does not exist';
        break;

      case 'P2002':
        // "Unique constraint failed on the {constraint}"
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[] | undefined;
        message = target
          ? `A record with this ${target.join(', ')} already exists`
          : 'A record with this unique field already exists';
        break;

      case 'P2003':
        // "Foreign key constraint failed on the field: {field_name}"
        status = HttpStatus.BAD_REQUEST;
        message =
          'Foreign key constraint violation. Related record does not exist';
        break;

      case 'P2004':
        // "A constraint failed on the database"
        status = HttpStatus.BAD_REQUEST;
        message = 'A database constraint was violated';
        break;

      case 'P2005':
        // "The value stored in the database is invalid for the field's type"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Invalid data stored in database';
        break;

      case 'P2006':
        // "The provided value for the field is not valid"
        status = HttpStatus.BAD_REQUEST;
        message = 'The provided value is not valid for the field type';
        break;

      case 'P2007':
        // "Data validation error"
        status = HttpStatus.BAD_REQUEST;
        message = 'Data validation error';
        break;

      case 'P2008':
        // "Failed to parse the query"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Failed to parse database query';
        break;

      case 'P2009':
        // "Failed to validate the query"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Failed to validate database query';
        break;

      case 'P2010':
        // "Raw query failed"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database query execution failed';
        break;

      case 'P2011':
        // "Null constraint violation on the {constraint}"
        status = HttpStatus.BAD_REQUEST;
        const field = exception.meta?.target || exception.meta?.column;
        message = field
          ? `Required field '${field}' cannot be null`
          : 'A required field is missing';
        break;

      case 'P2012':
        // "Missing a required value"
        status = HttpStatus.BAD_REQUEST;
        message = 'A required field is missing';
        break;

      case 'P2013':
        // "Missing the required argument"
        status = HttpStatus.BAD_REQUEST;
        message = 'A required argument is missing';
        break;

      case 'P2014':
        // "The change you are trying to make would violate the required relation"
        status = HttpStatus.BAD_REQUEST;
        message = 'This operation would violate a required relationship';
        break;

      case 'P2015':
        // "A related record could not be found"
        status = HttpStatus.NOT_FOUND;
        message = 'A related record could not be found';
        break;

      case 'P2016':
        // "Query interpretation error"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Query interpretation error';
        break;

      case 'P2017':
        // "The records for relation are not connected"
        status = HttpStatus.BAD_REQUEST;
        message = 'The records for this relation are not properly connected';
        break;

      case 'P2018':
        // "The required connected records were not found"
        status = HttpStatus.NOT_FOUND;
        message = 'Required connected records were not found';
        break;

      case 'P2019':
        // "Input error"
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid input provided';
        break;

      case 'P2020':
        // "Value out of range for the type"
        status = HttpStatus.BAD_REQUEST;
        message = 'Value is out of range for the field type';
        break;

      case 'P2021':
        // "The table does not exist in the current database"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database table does not exist';
        break;

      case 'P2022':
        // "The column does not exist in the current database"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database column does not exist';
        break;

      case 'P2023':
        // "Inconsistent column data"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Inconsistent column data in database';
        break;

      case 'P2024':
        // "Timed out fetching a new connection from the connection pool"
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection timeout. Please try again';
        break;

      case 'P2025':
        // "An operation failed because it depends on one or more records that were required but not found"
        status = HttpStatus.NOT_FOUND;
        message = 'Record to update or delete does not exist';
        break;

      case 'P2026':
        // "The current database provider doesn't support a feature"
        status = HttpStatus.NOT_IMPLEMENTED;
        message = 'This database operation is not supported';
        break;

      case 'P2027':
        // "Multiple errors occurred on the database during query execution"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Multiple database errors occurred';
        break;

      case 'P2028':
        // "Transaction API error"
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database transaction error';
        break;

      case 'P2030':
        // "Cannot find a fulltext index to use for the search"
        status = HttpStatus.BAD_REQUEST;
        message = 'Cannot perform fulltext search: index not found';
        break;

      case 'P2033':
        // "A number used in the query does not fit into a 64 bit signed integer"
        status = HttpStatus.BAD_REQUEST;
        message = 'Number value is too large';
        break;

      case 'P2034':
        // "Transaction failed due to a write conflict or a deadlock"
        status = HttpStatus.CONFLICT;
        message = 'Transaction failed due to conflict. Please retry';
        break;

      default:
        // Unknown Prisma error
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'An unexpected database error occurred';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: this.getErrorName(status),
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      ...(process.env.NODE_ENV === 'development' && {
        prismaCode: exception.code,
        prismaMessage: exception.message,
        meta: exception.meta,
      }),
    });
  }

  private getErrorName(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      case HttpStatus.NOT_IMPLEMENTED:
        return 'Not Implemented';
      default:
        return 'Error';
    }
  }
}
