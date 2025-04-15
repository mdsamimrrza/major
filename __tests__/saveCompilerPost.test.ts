import { POST } from '@/app/api/save/route';
import { db } from '@/utils/db';
import { UserData } from '@/utils/schema';

jest.mock("@/utils/db", () => ({
    db: {
        insert: jest.fn(() => ({
            values: jest.fn().mockResolvedValue([{ id: "1", code: "ABC123", email: "test@example.com" }])
        }))
    }
}));


describe('/api/save POST', () => {
    it('should return success message on successful data insert', async () => {
        const mockRequest = new Request('http://localhost/api/save', {
            method: 'POST',
            body: JSON.stringify({ id: 'ABC', code: 'ABC123', email: 'test@example.com' }),
            headers: { 'Content-Type': 'application/json' },
        });

        const response = await POST(mockRequest as any);
        expect(response).toBeDefined();

        if (response) {
            const json = await response.json();
            expect(json).toEqual({ message: 'Data saved successfully' });
            expect(db.insert).toHaveBeenCalledWith(UserData);
        }
    });
    ;});
