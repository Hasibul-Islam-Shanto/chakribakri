'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { JobFormPayload, JobStatus } from '@/types/job';

export interface JobActionResult {
  isSuccess: boolean;
  hasError: boolean;
  errorMessage?: string;
  createdJobId?: string;
}

export const createJobAction = async (formPayload: JobFormPayload): Promise<JobActionResult> => {
  try {
    if (!formPayload.company || formPayload.company.trim().length === 0) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Company name is required.',
      };
    }

    if (!formPayload.position || formPayload.position.trim().length === 0) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Position title is required.',
      };
    }

    const userSession = await getCurrentSession();

    const applicationDateParsed = formPayload.applicationDate
      ? new Date(formPayload.applicationDate)
      : new Date();

    const createdRecord = await prisma.job.create({
      data: {
        userId: userSession.userId || null,
        company: formPayload.company.trim(),
        position: formPayload.position.trim(),
        location: formPayload.location?.trim() || null,
        salary: formPayload.salary?.trim() || null,
        status: formPayload.status || 'Wishlist',
        applicationDate: isNaN(applicationDateParsed.getTime())
          ? new Date()
          : applicationDateParsed,
        jobUrl: formPayload.jobUrl?.trim() || null,
        notes: formPayload.notes?.trim() || null,
      },
    });

    revalidatePath('/dashboard');

    return {
      isSuccess: true,
      hasError: false,
      createdJobId: createdRecord.id,
    };
  } catch (creationError: unknown) {
    console.error('Failed to create job application:', creationError);
    return {
      isSuccess: false,
      hasError: true,
      errorMessage: 'Failed to create job application. Please try again.',
    };
  }
};

export const updateJobAction = async (
  jobId: string,
  formPayload: JobFormPayload
): Promise<JobActionResult> => {
  try {
    if (!jobId) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Missing job ID for update.',
      };
    }

    if (!formPayload.company || formPayload.company.trim().length === 0) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Company name is required.',
      };
    }

    if (!formPayload.position || formPayload.position.trim().length === 0) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Position title is required.',
      };
    }

    const applicationDateParsed = formPayload.applicationDate
      ? new Date(formPayload.applicationDate)
      : new Date();

    await prisma.job.update({
      where: { id: jobId },
      data: {
        company: formPayload.company.trim(),
        position: formPayload.position.trim(),
        location: formPayload.location?.trim() || null,
        salary: formPayload.salary?.trim() || null,
        status: formPayload.status,
        applicationDate: isNaN(applicationDateParsed.getTime())
          ? new Date()
          : applicationDateParsed,
        jobUrl: formPayload.jobUrl?.trim() || null,
        notes: formPayload.notes?.trim() || null,
      },
    });

    revalidatePath('/dashboard');

    return {
      isSuccess: true,
      hasError: false,
    };
  } catch (updateError: unknown) {
    console.error('Failed to update job application:', updateError);
    return {
      isSuccess: false,
      hasError: true,
      errorMessage: 'Failed to update job application.',
    };
  }
};

export const updateJobStatusAction = async (
  jobId: string,
  targetStatus: JobStatus
): Promise<JobActionResult> => {
  try {
    if (!jobId) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Missing job ID.',
      };
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: targetStatus,
      },
    });

    revalidatePath('/dashboard');

    return {
      isSuccess: true,
      hasError: false,
    };
  } catch (statusError: unknown) {
    console.error('Failed to update job status:', statusError);
    return {
      isSuccess: false,
      hasError: true,
      errorMessage: 'Failed to update status.',
    };
  }
};

export const deleteJobAction = async (jobId: string): Promise<JobActionResult> => {
  try {
    if (!jobId) {
      return {
        isSuccess: false,
        hasError: true,
        errorMessage: 'Missing job ID.',
      };
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath('/dashboard');

    return {
      isSuccess: true,
      hasError: false,
    };
  } catch (deletionError: unknown) {
    console.error('Failed to delete job application:', deletionError);
    return {
      isSuccess: false,
      hasError: true,
      errorMessage: 'Failed to delete job application.',
    };
  }
};
