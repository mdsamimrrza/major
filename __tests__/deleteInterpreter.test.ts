import { DELETE } from '@/app/api/deleteInt/route';
import { db } from '@/utils/db';
import { NextRequest } from 'next/server';

jest.mock('@/utils/db', () => ({
    db: {
        delete: jest.fn(() => ({
            where: jest.fn().mockResolvedValue({ rowCount: 0 })
        }))
    }
}));

beforeEach(() => {
    jest.clearAllMocks();
});

const createMockRequest = (url:string) => {
    return new NextRequest(new URL(url));
};

it('should return deleted if record exists', async () => {
    (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 1 }) // Simulating one record deleted
    });

    const request = createMockRequest('http://localhost/api/deleteInt?q=123');
    const response = await DELETE(request);
    const json = await response.json();

    expect(response).toBeDefined();
    expect(json).toEqual({ message: 'deleted' });
});

it('should return not deleted if no record exists', async () => {
    (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 0 }) // Simulating no records deleted
    });

    const request = createMockRequest('http://localhost/api/deleteInt?q=999');
    const response = await DELETE(request);
    const json = await response.json();

    expect(response).toBeDefined();
    expect(json).toEqual({ message: 'not deleted' });
});

it('should return invalid query parameter when query param is missing', async () => {
    const request = createMockRequest('http://localhost/api/deleteInt');
    const response = await DELETE(request);
    const json = await response.json();

    expect(response).toBeDefined();
    expect(json).toEqual({ message: 'Invalid query parameter' });
});
