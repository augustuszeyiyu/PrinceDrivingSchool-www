import fs from "fs";
import os from "os";
import path from "path";
import {Beson} from "beson/beson.esm.js";
import {Version} from "/kernel/version.esm.js";


// Arch kernel - https://github.com/JCloudYu/node.prototype.kernel/
const KernelArchVersion = [{identifier: "node.prototype.kernel", version: "1.1.5"}];

// Arch api - https://github.com/JCloudYu/node.prototype.api/
KernelArchVersion.push({identifier: "node.prototype.api", version: "1.0.1"});

// Arch dynamic-www - https://github.com/JCloudYu/node.prototype.api/
KernelArchVersion.push({identifier: "node.prototype.dynamic-view", version: "1.0.1"});

// other application arch type can add additional versions like following line
// KernelArchVersion.push({identifier: "other_arch_versions", version: "0.9.0"});




// INFO: Freeze KernelArchVersion to prevent further modifications
for(const item of KernelArchVersion) { Object.freeze(item); }
Object.freeze(KernelArchVersion);


// INFO: Prepare environmental information
const IsWindowsEnv = os.platform().substring(0, 3) === "win";
const WorkingRoot = path.dirname((import.meta.url).substring(IsWindowsEnv ? 8 : 7));
const CmdArgs = process.argv.slice(3);



const DATA = Object.assign(Object.create(null), {kernel_data:{}});
const KERNEL_DATA_STORAGE = `${WorkingRoot}/.kernel.bes`;
const _load_kernel_data=()=>{
	try {
		const buffer = fs.readFileSync(KERNEL_DATA_STORAGE);
		const kernel_data = Beson.Deserialize(buffer);
		if ( Object(kernel_data) !== kernel_data ) {
			throw new TypeError("Data stored in .kernel.bes must be an Object!");
		}
		
		DATA.kernel_data = kernel_data;
	}
	catch(e) {
		if ( e.code === "ENOENT" ) return;
		throw e;
	}
};
const _save_kernel_data=()=>{
	fs.writeFileSync(KERNEL_DATA_STORAGE, Buffer.from(Beson.Serialize(DATA.kernel_data)));
};
const KernelInfo = new Proxy({}, {
	get:(target, prop)=>{
		switch(prop) {
			case "save": return _save_kernel_data;
			case "load": return _load_kernel_data;
			case "cli_args":
				return CmdArgs.slice(0);
				
			default:
				return DATA.kernel_data[prop];
		}
	},
	set:(target, prop, value)=>{
		switch(prop) {
			case "save":
			case "load":
			case "cli_args":
				return false;
			
			default:
				DATA.kernel_data[prop] = value;
				return true;
		}
	}
});
const ProjectInfo = JSON.parse(fs.readFileSync(`${WorkingRoot}/package.json`));






export function Init() {
	_load_kernel_data();
}
export function CheckDataSystemVersion(auto_exit=true, verbose=true) {
	const {version:data_version} = DATA.kernel_data;
	if ( !data_version ) {
		if ( verbose ) {
			logger.error( `System is not initialized yet!` );
			logger.error( `Please initialize your system via update tool!` );
		}
		
		if ( auto_exit ) setTimeout(()=>process.exit(1));
		return false;
	}
	
	const proj_version = ProjectInfo.version;
	if ( Version.compare(data_version, proj_version, false) < 0 ) {
		if ( verbose ) {
			logger.error( `Data version is older than system version!` );
			logger.error( `Please update your system using update tool!` );
		}
		
		if ( auto_exit ) setTimeout(()=>process.exit(1));
		return false;
	}
	
	return true;
}
export function ResolveFileURIPath(url) {
	if ( url.substring(0, 7) !== "file://" ) return url;

	return url.substring(IsWindowsEnv ? 8 : 7);
}
export {IsWindowsEnv, WorkingRoot, KernelInfo, ProjectInfo, KernelArchVersion};
