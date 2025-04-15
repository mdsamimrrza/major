import { GET } from '@/app/api/save/route';
import { db } from '@/utils/db';
import { InterpData } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

jest.mock('@/utils/db', () => {
    return {
        db: {
            select: jest.fn(() => ({
                from: jest.fn(() => ({
                    where: jest.fn().mockResolvedValue([{ id: 'ABC', code: 'XYZ789' }])
                }))
            }))
        }
    };
});

const createMockRequest = (url: string) => {
    return {
        nextUrl: new URL(url, 'http://localhost'),
    } as unknown as NextRequest;
};

describe('/api/save GET', () => {
    it('should return match found if data exists', async () => {
        const mockRequest = createMockRequest('http://localhost/api/save?q=ABC');
        const response = await GET(mockRequest);
        const json = await response.json();

        expect(response).toBeDefined();
        expect(json).toEqual({ message: 'match found', res: [{ id: 'ABC', code: 'XYZ789' }] });
    });

    it('should return invalid query if no query param is provided', async () => {
        const mockRequest = createMockRequest('http://localhost/api/save');
        const response = await GET(mockRequest);
        const json = await response.json();

        expect(response).toBeDefined();
        expect(json).toEqual({ message: 'invalid query' });
    });
});
