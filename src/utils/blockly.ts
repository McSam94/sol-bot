export const xmlToStr = (xml: Node) => {
	const serializer = new XMLSerializer();
	return serializer.serializeToString(xml);
};

export const fetchXml = (filePath: string) => {
	return new Promise(resolve => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				resolve(this.responseText);
			}
		};
		xhttp.open('GET', filePath, true);
		xhttp.send();
	});
};
