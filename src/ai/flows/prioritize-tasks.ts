'use server';
/**
 * @fileOverview Task prioritization AI agent.
 *
 * - prioritizeTasks - A function that prioritizes tasks based on deadlines and estimated effort.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      deadline: z.string().describe('The deadline of the task (ISO format).'),
      estimatedEffort: z
        .string()
        .describe('The estimated effort in hours needed to complete the task.'),
    })
  ).describe('The tasks to prioritize.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      priority: z.number().describe('The priority of the task (1 being highest).'),
      reason: z.string().describe('The reason for the assigned priority.'),
    })
  ).describe('The prioritized tasks with reasons.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(
  input: PrioritizeTasksInput
): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {
    schema: z.object({
      tasks: z.array(
        z.object({
          name: z.string().describe('The name of the task.'),
          deadline: z.string().describe('The deadline of the task (ISO format).'),
          estimatedEffort: z
            .string()
            .describe('The estimated effort in hours needed to complete the task.'),
        })
      ).describe('The tasks to prioritize.'),
    }),
  },
  output: {
    schema: z.object({
      prioritizedTasks: z.array(
        z.object({
          name: z.string().describe('The name of the task.'),
          priority: z.number().describe('The priority of the task (1 being highest).'),
          reason: z.string().describe('The reason for the assigned priority.'),
        })
      ).describe('The prioritized tasks with reasons.'),
    }),
  },
  prompt: `You are an AI task prioritization assistant. Given a list of tasks with their deadlines and estimated effort, you will prioritize them.

Prioritize the following tasks:
{{#each tasks}}
- Task: {{name}}, Deadline: {{deadline}}, Effort: {{estimatedEffort}} hours
{{/each}}

Return a list of prioritized tasks with a priority (1 being the highest) and a reason for the assigned priority.
`,
});

const prioritizeTasksFlow = ai.defineFlow<
  typeof PrioritizeTasksInputSchema,
  typeof PrioritizeTasksOutputSchema
>(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
