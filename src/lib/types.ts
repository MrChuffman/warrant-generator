export interface SavedWarrants {
	id: string;
	timestamp: number;
	incidentNumber: string;
	warrantType: string;
	warrant: NarcoticsSeizureWarrant | AlteredVINsSeizureWarrant;
	warrantTypeFriendly: string;
	subject: string[];
	setup: WarrantSetup;
	data?: any;
}

export interface HeroSheet {
	title: string;
	content: string;
}

export interface WarrantSetup {
	warrantType: string;
	incidentNumber: string;
	chargeCode: string;
	// Add new judicial fields
	judicialState: string;
	judicialCounty: string;
	judicialJudge: string;
	affiantTitle: string;
	affiantFirstName: string;
	affiantLastName: string;
	affiantDepartment: string;
	affiantHerosheet: string;
	heroSheets: HeroSheet[];
	errors?: {
		warrantType?: string;
		incidentNumber?: string;
		chargeCode?: string;
		// Add new judicial field errors
		judicialState?: string;
		judicialCounty?: string;
		judicialJudge?: string;
		affiantTitle?: string;
		affiantFirstName?: string;
		affiantLastName?: string;
		affiantDepartment?: string;
		affiantHerosheet?: string;
	};
}

export interface NarcoticsSeizureWarrant {
	seizableItems: string;
	factsAndCircumstances: string;
	errors?: {
		seizableItems?: string;
		factsAndCircumstances?: string;
	};
}

export interface AlteredVINsSeizureWarrant {
	seizableVehicles: string;
	factsAndCircumstances: string;
	errors?: {
		seizableVehicles?: string;
		factsAndCircumstances?: string;
	};
}
