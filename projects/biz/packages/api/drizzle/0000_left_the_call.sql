CREATE TABLE `interview_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`phase` text NOT NULL,
	`question` text NOT NULL,
	`question_type` text NOT NULL,
	`answer` text,
	`answer_state` text DEFAULT 'missing' NOT NULL,
	`options` text,
	`rfp_mapping` text NOT NULL,
	`validation_attempts` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`current_phase` text DEFAULT 'seed' NOT NULL,
	`current_step` integer DEFAULT 1 NOT NULL,
	`completion_rate` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rfp_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`version` text DEFAULT '1.0' NOT NULL,
	`content` text NOT NULL,
	`completion_rate` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
