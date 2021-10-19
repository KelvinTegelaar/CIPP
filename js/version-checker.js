var RemoteURLCIPP = 'https://raw.githubusercontent.com/KelvinTegelaar/CIPP/master/version_latest.txt';
var LocalURLCIPP = '/version_latest.txt';

var RemoteURLCIPPAPI = 'https://raw.githubusercontent.com/KelvinTegelaar/CIPP-API/master/version_latest.txt';
var LocalURLCIPPAPI = '/api/GetVersion';

function getRemote(remote_url) {
return $.ajax({
    type: "GET",
    url: remote_url,
    async: false
}).responseText;
}

var RemoteCIPPVersionRaw = getRemote(RemoteURLCIPP);
var LocalCIPPVersionRaw = getRemote(LocalURLCIPP);
var RemoteCIPPAPIVersionRaw = getRemote(RemoteURLCIPPAPI);
var LocalCIPPAPIVersionRaw = getRemote(LocalURLCIPPAPI);

var RemoteCIPPVersion = RemoteCIPPVersionRaw.replace(/(\r\n|\n|\r)/gm, "");
var LocalCIPPVersion = LocalCIPPVersionRaw.replace(/(\r\n|\n|\r)/gm, "");
var RemoteCIPPAPIVersion = RemoteCIPPAPIVersionRaw.replace(/(\r\n|\n|\r)/gm, "");
var LocalCIPPAPIVersion = LocalCIPPAPIVersionRaw.replace(/(\r\n|\n|\r)/gm, "");

console.log(RemoteCIPPVersion)
console.log(LocalCIPPVersion)
console.log(RemoteCIPPAPIVersion)
console.log(LocalCIPPAPIVersion)

document.getElementById('dashversionlocalcipp').innerHTML = LocalCIPPVersion;
document.getElementById('dashversionremotecipp').innerHTML = RemoteCIPPVersion;
document.getElementById('dashversionlocalcippapi').innerHTML = LocalCIPPAPIVersion;
document.getElementById('dashversionremotecippapi').innerHTML = RemoteCIPPAPIVersion;

if (RemoteCIPPVersion == LocalCIPPVersion) {
    console.log("CIPP Local Version is same as Remote");
} else
{
    console.log("CIPP Remote and Local Versions are Different")
    document.getElementById('versionalertcipp').innerHTML = '<div><strong>WARNING:&nbsp;&nbsp;</strong> The version of CIPP you are running is out of date. Your version is ' + LocalCIPPVersion + ' and the latest version is ' + RemoteCIPPVersion + '. Please Update your CIPP Repository.</div>';
    document.getElementById('versionalertcipp').classList.remove("d-none");
}

if (RemoteCIPPAPIVersion == LocalCIPPAPIVersion) {
    console.log("CIPPAPI Local Version is same as Remote");
} else
{
    console.log("CIPPAPI Remote and Local Versions are Different")
    document.getElementById('versionalertcippapi').innerHTML = '<div><strong>WARNING:&nbsp;&nbsp;</strong> The version of CIPP-API you are running is out of date. Your version is ' + LocalCIPPAPIVersion + ' and the latest version is ' + RemoteCIPPAPIVersion + '. Please Update your CIPP-API Repository.</div>';
    document.getElementById('versionalertcippapi').classList.remove("d-none");
}





