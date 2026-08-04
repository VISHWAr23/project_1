import { z } from 'zod';
export declare const attendanceStatusEnum: z.ZodEnum<["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY", "WEEKLY_OFF"]>;
export declare const createAttendanceSchema: z.ZodObject<{
    employeeId: z.ZodString;
    date: z.ZodString;
    checkIn: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    checkOut: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    status: z.ZodDefault<z.ZodEnum<["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY", "WEEKLY_OFF"]>>;
    workingHours: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    remarks: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF";
    workingHours: number;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    remarks?: string | undefined;
}, {
    employeeId: string;
    date: string;
    status?: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF" | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workingHours?: number | undefined;
    remarks?: string | undefined;
}>;
export declare const bulkAttendanceItemSchema: z.ZodObject<{
    employeeId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY", "WEEKLY_OFF"]>>;
    checkIn: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    checkOut: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    workingHours: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    remarks: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF";
    workingHours: number;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    remarks?: string | undefined;
}, {
    employeeId: string;
    status?: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF" | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workingHours?: number | undefined;
    remarks?: string | undefined;
}>;
export declare const bulkAttendanceSchema: z.ZodObject<{
    date: z.ZodString;
    departmentId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    records: z.ZodArray<z.ZodObject<{
        employeeId: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY", "WEEKLY_OFF"]>>;
        checkIn: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        checkOut: z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
        workingHours: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        remarks: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        employeeId: string;
        status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF";
        workingHours: number;
        checkIn?: string | null | undefined;
        checkOut?: string | null | undefined;
        remarks?: string | undefined;
    }, {
        employeeId: string;
        status?: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF" | undefined;
        checkIn?: string | null | undefined;
        checkOut?: string | null | undefined;
        workingHours?: number | undefined;
        remarks?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date: string;
    records: {
        employeeId: string;
        status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF";
        workingHours: number;
        checkIn?: string | null | undefined;
        checkOut?: string | null | undefined;
        remarks?: string | undefined;
    }[];
    departmentId?: string | undefined;
}, {
    date: string;
    records: {
        employeeId: string;
        status?: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF" | undefined;
        checkIn?: string | null | undefined;
        checkOut?: string | null | undefined;
        workingHours?: number | undefined;
        remarks?: string | undefined;
    }[];
    departmentId?: string | undefined;
}>;
export declare const updateAttendanceSchema: z.ZodObject<{
    employeeId: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    checkIn: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>>;
    checkOut: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY", "WEEKLY_OFF"]>>>;
    workingHours: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    remarks: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, "strip", z.ZodTypeAny, {
    employeeId?: string | undefined;
    date?: string | undefined;
    status?: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF" | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workingHours?: number | undefined;
    remarks?: string | undefined;
}, {
    employeeId?: string | undefined;
    date?: string | undefined;
    status?: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKLY_OFF" | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workingHours?: number | undefined;
    remarks?: string | undefined;
}>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
//# sourceMappingURL=attendance.schema.d.ts.map