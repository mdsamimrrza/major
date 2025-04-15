import { PUT } from '@/app/api/save/route';
import { db } from '@/utils/db';
import { UserData } from '@/utils/schema';
import { eq } from 'drizzle-orm';

jest.mock('@/utils/db', () => {
    const mockSet = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockResolvedValue(1);
    return {
        db: {
            update: jest.fn(() => ({ set: mockSet, where: mockWhere }))
        }
    };
});

describe('/api/save PUT', () => {
        it('should return success message on successful data update', async () => {
            const mockRequest = new Request('http://localhost/api/save', {
                method: 'PUT',
                body: JSON.stringify({ id: 'ABC', code: 'XYZ789' }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await PUT(mockRequest as any);
            expect(response).toBeDefined();

            if (!response) {
                throw new Error('Response is undefined');
            }

            const json = await response.json();
            expect(json).toEqual({ message: 'Data updated successfully' });

            expect(db.update).toHaveBeenCalledWith(UserData);
            expect(db.update(UserData).set).toHaveBeenCalledTimes(1);
            expect(db.update(UserData).set).toHaveBeenCalledWith({ code: 'XYZ789' });
            expect(db.update(UserData).set({ code: 'XYZ789' }).where).toHaveBeenCalledWith(eq(UserData.id, 'ABC'));
        });});
