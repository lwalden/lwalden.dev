export interface ExperienceEntry {
	company: string;
	title: string;
	startDate: string;
	endDate: string;
	description: string;
	highlights: string[];
	technologies: string[];
}

// TODO: User to customize — fill in actual highlights, dates, and any prior roles
export const experience: ExperienceEntry[] = [
	{
		company: 'Columbia Sportswear',
		title: 'Senior Software Engineer',
		startDate: 'Jan 2013',
		endDate: 'Dec 2024',
		description:
			'Senior engineer on enterprise .NET and Azure systems supporting global retail and e-commerce operations.',
		highlights: [
			'TODO: Add 2-4 achievement bullets — quantify impact where possible (scale, users, performance gains)',
			'TODO: Example: "Architected event-driven order processing pipeline handling X million transactions/month"',
			'TODO: Example: "Led migration of legacy SOAP services to REST APIs, reducing latency by X%"',
			'TODO: Example: "Implemented AI-assisted tooling for X, cutting development time by X%"',
		],
		technologies: ['C#', '.NET', 'Azure', 'SQL Server', 'Azure DevOps', 'Azure Service Bus'],
	},
	// TODO: Add prior roles here if applicable
];
