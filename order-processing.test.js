const AWS = require('aws-sdk-mock');
const { handler } = require('../functions/order-processing');

describe('Order Processing Lambda Function', () => {
    beforeEach(() => {
        AWS.restore();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    test('createOrder - should successfully create a new order', async () => {
        // Mock DynamoDB put
        AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, {});
        });

        // Mock SNS publish
        AWS.mock('SNS', 'publish', (params, callback) => {
            callback(null, {});
        });

        const event = {
            httpMethod: 'POST',
            path: '/orders',
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test@example.com'
                    }
                }
            },
            body: JSON.stringify({
                restaurantId: 'rest123',
                items: [
                    { id: 'item1', name: 'Burger', price: 10.99, quantity: 2 }
                ],
                deliveryAddress: {
                    street: '123 Main St',
                    city: 'Test City',
                    zipCode: '12345'
                },
                paymentMethod: 'CARD'
            })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.message).toBe('Order created successfully');
        expect(body.orderId).toBeDefined();
    });

    test('listOrders - should return user orders', async () => {
        const mockOrders = [
            {
                orderId: 'ord123',
                userId: 'test@example.com',
                status: 'PENDING'
            }
        ];

        // Mock DynamoDB query
        AWS.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
            callback(null, { Items: mockOrders });
        });

        const event = {
            httpMethod: 'GET',
            path: '/orders',
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test@example.com'
                    }
                }
            }
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(mockOrders);
    });

    test('getOrder - should return specific order', async () => {
        const mockOrder = {
            orderId: 'ord123',
            userId: 'test@example.com',
            status: 'PENDING'
        };

        // Mock DynamoDB get
        AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
            callback(null, { Item: mockOrder });
        });

        const event = {
            httpMethod: 'GET',
            path: '/orders/{orderId}',
            pathParameters: {
                orderId: 'ord123'
            }
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(mockOrder);
    });

    test('updateOrderStatus - should update order status', async () => {
        // Mock DynamoDB update
        AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
            callback(null, {
                Attributes: {
                    orderId: 'ord123',
                    status: 'DELIVERED',
                    userId: 'test@example.com'
                }
            });
        });

        // Mock SNS publish
        AWS.mock('SNS', 'publish', (params, callback) => {
            callback(null, {});
        });

        const event = {
            httpMethod: 'PUT',
            path: '/orders/{orderId}/status',
            pathParameters: {
                orderId: 'ord123'
            },
            body: JSON.stringify({
                status: 'DELIVERED'
            })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.message).toBe('Order status updated successfully');
        expect(body.order.status).toBe('DELIVERED');
    });

    test('invalid path - should return 404', async () => {
        const event = {
            httpMethod: 'GET',
            path: '/invalid',
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test@example.com'
                    }
                }
            }
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body)).toEqual({
            message: 'Not Found'
        });
    });
});