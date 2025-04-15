import { GET } from '@/app/api/getInt/route';
import { db } from '@/utils/db';
import { NextRequest } from 'next/server';

jest.mock('@/utils/db', () => ({
    db: {
        select: jest.fn(() => ({
            from: jest.fn(() => ({
                where: jest.fn()
            }))
        }))
    }
}));

beforeEach(() => {
    jest.clearAllMocks();
});

const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url));
};

it('should return match found if data exists', async () => {
    (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ email: 'test@example.com', code: 'XYZ789' }])
        })
    });

    const request = createMockRequest('http://localhost/api/getInt?q=test@example.com');
    const response = await GET(request);
    const json = await response.json();

    expect(response).toBeDefined();
    expect(json).toEqual({ message: 'match found', res: [{ email: 'test@example.com', code: 'XYZ789' }] });
});

it('should return match found with empty array if no data exists', async () => {
    (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([])
        })
    });

    const request = createMockRequest('http://localhost/api/getInt?q=notfound@example.com');
    const response = await GET(request);
    const json = await response.json();

    expect(response).toBeDefined();
    expect(json).toEqual({ message: 'match found', res: [] });
});

it('should return invalid query when query param is missing', async () => {
    const request = createMockRequest('http://localhost/api/getInt');
    const response = await GET(request);
    const json = await response.json();

    expect(response).toBeDefined();
    expect(json).toEqual({ message: 'Invalid query' });
});
