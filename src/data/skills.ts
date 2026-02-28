export interface Skill {
	name: string;
	category: 'languages' | 'cloud' | 'ai' | 'tools';
	proficiency: 'expert' | 'advanced' | 'intermediate';
}

export const skills: Skill[] = [
	// Languages & Frameworks
	{ name: 'C#', category: 'languages', proficiency: 'expert' },
	{ name: '.NET / ASP.NET Core', category: 'languages', proficiency: 'expert' },
	{ name: 'SQL Server', category: 'languages', proficiency: 'expert' },
	{ name: 'JavaScript / TypeScript', category: 'languages', proficiency: 'advanced' },
	{ name: 'Python', category: 'languages', proficiency: 'intermediate' },

	// Cloud & Infrastructure
	{ name: 'Azure', category: 'cloud', proficiency: 'expert' },
	{ name: 'Azure DevOps', category: 'cloud', proficiency: 'expert' },
	{ name: 'Azure AI Foundry', category: 'cloud', proficiency: 'advanced' },
	{ name: 'Azure Service Bus', category: 'cloud', proficiency: 'expert' },
	{ name: 'Azure Functions', category: 'cloud', proficiency: 'advanced' },

	// AI & Machine Learning
	{ name: 'Semantic Kernel', category: 'ai', proficiency: 'advanced' },
	{ name: 'MCP (Model Context Protocol)', category: 'ai', proficiency: 'advanced' },
	{ name: 'OpenAI / Claude APIs', category: 'ai', proficiency: 'advanced' },
	{ name: 'Microsoft Agent Framework', category: 'ai', proficiency: 'advanced' },

	// Tools & Practices
	{ name: 'Git', category: 'tools', proficiency: 'expert' },
	{ name: 'Docker', category: 'tools', proficiency: 'advanced' },
	{ name: 'CI/CD Pipelines', category: 'tools', proficiency: 'expert' },
	{ name: 'Software Architecture', category: 'tools', proficiency: 'expert' },

	// TODO: User should review and adjust proficiency levels and add/remove skills
];

export const categoryLabels: Record<Skill['category'], string> = {
	languages: 'Languages & Frameworks',
	cloud: 'Cloud & Infrastructure',
	ai: 'AI & Machine Learning',
	tools: 'Tools & Practices',
};
