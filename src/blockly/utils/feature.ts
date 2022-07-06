import filesaver from 'file-saver';

export const saveAs = ({ data, filename, opts }: { data: string; filename: string; opts: BlobPropertyBag }) => {
	const blob = new Blob([data], opts);
	filesaver.saveAs(blob, filename);
};
