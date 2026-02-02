import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const firstDayOfMonth = startOfMonth(today);
        const lastDayOfMonth = endOfMonth(today);

        // 1. Total Employees
        const totalEmployees = await prisma.employee.count();

        // 2. Presence Today (Employees with at least one punch today)
        const presenceToday = await prisma.punch.groupBy({
            by: ['employeeId'],
            where: {
                dateTime: {
                    gte: startOfDay(today),
                    lte: endOfDay(today)
                }
            }
        });

        // 3. Monthly Stats (Overtime and Delays)
        const monthlyWorkdays = await prisma.workday.findMany({
            where: {
                date: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth
                }
            },
            select: {
                extraMinutes: true,
                balanceMinutes: true,
                workedMinutes: true,
                expectedMinutes: true
            }
        });

        let totalExtraMinutes = 0;
        let totalDelayMinutes = 0;
        monthlyWorkdays.forEach(wd => {
            totalExtraMinutes += wd.extraMinutes || 0;
            if (wd.balanceMinutes < 0) {
                totalDelayMinutes += Math.abs(wd.balanceMinutes);
            }
        });

        // 4. Checklist Progress
        const treatedCount = await prisma.employee.count({
            where: { isTreated: true }
        });

        res.json({
            employees: {
                total: totalEmployees,
                present: presenceToday.length,
                absent: totalEmployees - presenceToday.length
            },
            monthly: {
                extraHours: (totalExtraMinutes / 60).toFixed(1),
                delayHours: (totalDelayMinutes / 60).toFixed(1),
                balanceHours: ((totalExtraMinutes - totalDelayMinutes) / 60).toFixed(1)
            },
            checklist: {
                total: totalEmployees,
                treated: treatedCount,
                percent: totalEmployees > 0 ? Math.round((treatedCount / totalEmployees) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Erro ao carregar estatísticas do dashboard.' });
    }
};
