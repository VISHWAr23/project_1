import { z } from 'zod';
export declare const createJobWorkCompanySchema: z.ZodObject<{
    companyName: z.ZodString;
    contactPerson: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    gstin: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    creditDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    creditDays: number;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    contactPerson?: string | undefined;
    gstin?: string | undefined;
}, {
    companyName: string;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    contactPerson?: string | undefined;
    gstin?: string | undefined;
    creditDays?: number | undefined;
}>;
export type CreateJobWorkCompanyInput = z.infer<typeof createJobWorkCompanySchema>;
export declare const createJobWorkOrderSchema: z.ZodObject<{
    jobWorkCompanyId: z.ZodString;
    rawMaterialId: z.ZodString;
    finishedProductId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    expectedReturnDate: z.ZodString;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rawMaterialId: string;
    jobWorkCompanyId: string;
    expectedReturnDate: string;
    remarks?: string | undefined;
    finishedProductId?: string | null | undefined;
}, {
    rawMaterialId: string;
    jobWorkCompanyId: string;
    expectedReturnDate: string;
    remarks?: string | undefined;
    finishedProductId?: string | null | undefined;
}>;
export type CreateJobWorkOrderInput = z.infer<typeof createJobWorkOrderSchema>;
export declare const issueItemSchema: z.ZodObject<{
    rollNumber: z.ZodString;
    batchId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    issuedWeight: z.ZodNumber;
    issuedQty: z.ZodNumber;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rollNumber: string;
    issuedWeight: number;
    issuedQty: number;
    remarks?: string | undefined;
    batchId?: string | null | undefined;
}, {
    rollNumber: string;
    issuedWeight: number;
    issuedQty: number;
    remarks?: string | undefined;
    batchId?: string | null | undefined;
}>;
export type IssueItemInput = z.infer<typeof issueItemSchema>;
export declare const issueMaterialsSchema: z.ZodObject<{
    vehicleNumber: z.ZodString;
    driverName: z.ZodString;
    remarks: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        rollNumber: z.ZodString;
        batchId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        issuedWeight: z.ZodNumber;
        issuedQty: z.ZodNumber;
        remarks: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        rollNumber: string;
        issuedWeight: number;
        issuedQty: number;
        remarks?: string | undefined;
        batchId?: string | null | undefined;
    }, {
        rollNumber: string;
        issuedWeight: number;
        issuedQty: number;
        remarks?: string | undefined;
        batchId?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    vehicleNumber: string;
    driverName: string;
    items: {
        rollNumber: string;
        issuedWeight: number;
        issuedQty: number;
        remarks?: string | undefined;
        batchId?: string | null | undefined;
    }[];
    remarks?: string | undefined;
}, {
    vehicleNumber: string;
    driverName: string;
    items: {
        rollNumber: string;
        issuedWeight: number;
        issuedQty: number;
        remarks?: string | undefined;
        batchId?: string | null | undefined;
    }[];
    remarks?: string | undefined;
}>;
export type IssueMaterialsInput = z.infer<typeof issueMaterialsSchema>;
export declare const returnItemSchema: z.ZodObject<{
    finishedProductId: z.ZodString;
    rollNumber: z.ZodString;
    returnedWeight: z.ZodNumber;
    returnedQty: z.ZodNumber;
    wastageWeight: z.ZodDefault<z.ZodNumber>;
    wastageQty: z.ZodDefault<z.ZodNumber>;
    photoUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    finishedProductId: string;
    rollNumber: string;
    returnedWeight: number;
    returnedQty: number;
    wastageWeight: number;
    wastageQty: number;
    remarks?: string | undefined;
    photoUrls?: string[] | undefined;
}, {
    finishedProductId: string;
    rollNumber: string;
    returnedWeight: number;
    returnedQty: number;
    remarks?: string | undefined;
    wastageWeight?: number | undefined;
    wastageQty?: number | undefined;
    photoUrls?: string[] | undefined;
}>;
export type ReturnItemInput = z.infer<typeof returnItemSchema>;
export declare const receiveReturnSchema: z.ZodObject<{
    returnedDate: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        finishedProductId: z.ZodString;
        rollNumber: z.ZodString;
        returnedWeight: z.ZodNumber;
        returnedQty: z.ZodNumber;
        wastageWeight: z.ZodDefault<z.ZodNumber>;
        wastageQty: z.ZodDefault<z.ZodNumber>;
        photoUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        remarks: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        finishedProductId: string;
        rollNumber: string;
        returnedWeight: number;
        returnedQty: number;
        wastageWeight: number;
        wastageQty: number;
        remarks?: string | undefined;
        photoUrls?: string[] | undefined;
    }, {
        finishedProductId: string;
        rollNumber: string;
        returnedWeight: number;
        returnedQty: number;
        remarks?: string | undefined;
        wastageWeight?: number | undefined;
        wastageQty?: number | undefined;
        photoUrls?: string[] | undefined;
    }>, "many">;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        finishedProductId: string;
        rollNumber: string;
        returnedWeight: number;
        returnedQty: number;
        wastageWeight: number;
        wastageQty: number;
        remarks?: string | undefined;
        photoUrls?: string[] | undefined;
    }[];
    returnedDate: string;
    remarks?: string | undefined;
}, {
    items: {
        finishedProductId: string;
        rollNumber: string;
        returnedWeight: number;
        returnedQty: number;
        remarks?: string | undefined;
        wastageWeight?: number | undefined;
        wastageQty?: number | undefined;
        photoUrls?: string[] | undefined;
    }[];
    returnedDate: string;
    remarks?: string | undefined;
}>;
export type ReceiveReturnInput = z.infer<typeof receiveReturnSchema>;
export declare const closeJobWorkOrderSchema: z.ZodObject<{
    remarks: z.ZodOptional<z.ZodString>;
    confirmed: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    confirmed: boolean;
    remarks?: string | undefined;
}, {
    confirmed: boolean;
    remarks?: string | undefined;
}>;
export type CloseJobWorkOrderInput = z.infer<typeof closeJobWorkOrderSchema>;
//# sourceMappingURL=job-work.schema.d.ts.map