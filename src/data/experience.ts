export interface ExperienceEntry {
	company: string;
	title: string;
	startDate: string;
	endDate: string;
	description: string;
	highlights: string[];
	technologies: string[];
}

export const experience: ExperienceEntry[] = [
	{
		company: 'Enterprise Retail & E-Commerce',
		title: 'Senior Software Development Engineer',
		startDate: 'Nov 2023',
		endDate: 'Present',
		description:
			'Tech lead and senior engineer on enterprise .NET and Azure systems supporting global retail and e-commerce operations.',
		highlights: [
			'Promoted to project tech lead within six months — leading solution design, documentation, and cross-team implementation',
			'Refactored a high-volume multi-step workflow, reducing processing time by 96% (6 minutes to 12 seconds) and cutting monthly CosmosDB costs by 40%',
			'Architected a replacement for a legacy critical system, reducing daily failed transactions from 2,000 to under 1 and eliminating manual engineering intervention',
			'Led design of a Photo Studio automation system, eliminating 1,000+ hours of annual manual labor',
			'Reduced daily batch processing windows from hours to minutes through optimized Azure Functions and Service Bus pipelines',
		],
		technologies: ['C#', '.NET', 'Azure Functions', 'Azure Service Bus', 'CosmosDB', 'Azure DevOps'],
	},
	{
		company: 'Enterprise HR Tech & Background Screening (SaaS)',
		title: 'Senior Software Development Engineer II',
		startDate: 'Oct 2019',
		endDate: 'Nov 2023',
		description:
			'Senior engineer and subject matter expert on core SaaS applications serving highly regulated background screening workflows.',
		highlights: [
			'Served as SME for core systems, providing architectural guidance across CQRS-based SaaS applications with high availability requirements',
			'Designed and maintained Web APIs, Azure Functions, and message queues supporting regulated data standards and partner integrations',
			'Owned complex front-end implementations in VueJS, providing UI/UX architectural guidance',
			'Conducted technical interviews and mentored new hires, standardizing development practices across the team',
		],
		technologies: ['C#', '.NET', 'Azure', 'CQRS', 'VueJS', 'TypeScript', 'Azure Service Bus'],
	},
	{
		company: 'Identity Verification & Physical Security (SaaS)',
		title: 'Software Development Engineer',
		startDate: 'Jun 2014',
		endDate: 'Oct 2019',
		description:
			'Full-stack engineer building identity verification and physical security SaaS products from early-stage through production at scale.',
		highlights: [
			'Built robust backend systems using .NET Framework with code-first relational models on MS SQL and Azure Queues',
			'Pioneered core frontend patterns and introduced TypeScript to the organization, establishing coding standards and unit testing practices',
			'Conducted R&D spikes and delivered proofs of concept to guide technology adoption and project feasibility',
		],
		technologies: ['C#', '.NET Framework', 'TypeScript', 'JavaScript', 'MS SQL', 'Azure'],
	},
];
