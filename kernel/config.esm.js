/**
 *	Author: JCloudYu
 *	Create: 2019/05/27
**/
export const Config = Object.create(null);

export async function Init() {
	// NOTE: Load default configurations
	const {default:CONFIG} = await import( "/config.default.esm.js" );
	Object.merge(Config, CONFIG);
	
	// NOTE: Load customized configurations in project root
	let es_config_loaded = false;
	try {
		const {default:CUSTOMIZED_CONFIG} = await import( "/config.esm.js" );
		Object.merge(Config, CUSTOMIZED_CONFIG);
		es_config_loaded = true;
	} catch(e) {}
	
	if ( !es_config_loaded ) {
		try {
			const {default:CUSTOMIZED_CONFIG} = await import( "/config.js" );
			Object.merge(Config, CUSTOMIZED_CONFIG);
		} catch(e) {}
	}
}
