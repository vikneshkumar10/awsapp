const AWS = require('aws-sdk-mock');
const { handler } = require('../functions/user-management');

describe('User Management Lambda Function', () => {
    beforeEach(() => {
        AWS.restore();
    });

    test('registerUser - should successfully register a new user', async () => {
        // Mock Cognito adminCreateUser
        AWS.mock('CognitoIdentityServiceProvider', 'adminCreateUser', (params, callback) => {
            callback(null, { User: { Username: params.Username } });
        });

        // Mock DynamoDB put
        AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
            callback(null, {});
        });

        const event = {
            httpMethod: 'POST',
            path: '/register',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'Password123!',
                name: 'Test User',
                phoneNumber: '+1234567890'
            })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body)).toEqual({
            message: 'User registered successfully'
        });
    });

    test('loginUser - should successfully authenticate user', async () => {
        // Mock Cognito initiateAuth
        AWS.mock('CognitoIdentityServiceProvider', 'initiateAuth', (params, callback) => {
            callback(null, {
                AuthenticationResult: {
                    IdToken: 'mock-id-token',
                    RefreshToken: 'mock-refresh-token'
                }
            });
        });

        const event = {
            httpMethod: 'POST',
            path: '/login',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'Password123!'
            })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            token: 'mock-id-token',
            refreshToken: 'mock-refresh-token'
        });
    });

    test('getUserProfile - should return user profile', async () => {
        const mockUser = {
            userId: 'test@example.com',
            name: 'Test User',
            phoneNumber: '+1234567890'
        };

        // Mock DynamoDB get
        AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
            callback(null, { Item: mockUser });
        });

        const event = {
            httpMethod: 'GET',
            path: '/profile',
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
        expect(JSON.parse(response.body)).toEqual(mockUser);
    });

    test('updateUserProfile - should update user profile', async () => {
        // Mock DynamoDB update
        AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
            callback(null, {});
        });

        const event = {
            httpMethod: 'PUT',
            path: '/profile',
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test@example.com'
                    }
                }
            },
            body: JSON.stringify({
                name: 'Updated Name',
                phoneNumber: '+9876543210'
            })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: 'Profile updated successfully'
        });
    });
});