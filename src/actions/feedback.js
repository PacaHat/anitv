"use server"
import { inMemoryStorage } from "@/lib/inMemoryStorage";

export const getFeedbacks = async (req) => {
    try {
        const reports = await inMemoryStorage.find('feedback');
        if (!reports || reports.length === 0) {
            return { message: "No feedback reports found" };
        }
        return reports;
    } catch (error) {
        console.error("Error fetching feedback reports:", error);
        return { message: "Failed to retrieve feedback reports. Please try again later." , status: 500};
    }
};

export const createFeedback = async (data) => {
    const { title, description, type, severity } = data;

    try {
        const newReport = await inMemoryStorage.create('feedback', {
            title: title,
            description: description,
            type: type,
            severity: severity,
            createdAt: new Date()
        });

        return { message: "Feedback report saved successfully" , status: 201};
    } catch (error) {
        console.error("Error saving feedback report:", error);
        return { message: "Failed to save feedback report. Please try again later." , status: 500 };
    }
};

export const deletFeedback = async (id) => {
    try {
        if (id) {
            const result = await inMemoryStorage.deleteOne('feedback', { id });
            if (result.deletedCount === 0) {
                return { message: `Feedback report with ID ${id} not found` };
            }
            return { message: `Feedback report with ID ${id} deleted successfully` };
        } else {
            const result = await inMemoryStorage.deleteMany('feedback');
            return { message: `Deleted ${result.deletedCount} feedback reports` };
        }
    } catch (error) {
        console.error(`Error deleting feedback report${id ? ` with ID ${id}` : 's'}:`, error);
        return { message: "Failed to delete feedback report(s). Please try again later." };
    }
};
