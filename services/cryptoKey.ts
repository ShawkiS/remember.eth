import lf from 'localforage'
import keccak256 from 'keccak256';

export const createKeys = async () => { 
	const keys = await crypto.subtle.generateKey({ 
		name: 'ECDSA',
		namedCurve: 'P-256' }, 
		false, 
		[ 'sign', 'verify' ]);

		lf.setItem("privateKey", keys.privateKey);
		lf.setItem("publicKey", keys.publicKey);
}

export const sign = async (data: any) => {
	const keys = await lf.getItem("privateKey");

	return (await window.crypto.subtle.sign(
		{
			name: "ECDSA",
			hash: {name: "SHA-256"}, 
		},
		keys as any, 
		new TextEncoder().encode(data) 
	))
}

export const verify = async (signature: any, data: any) => { 
	const publicKey = await lf.getItem("publicKey");
	const enc = new TextEncoder(); 
	const newdata = enc.encode(data);

	const result = await window.crypto.subtle.verify(
		{
			name: "ECDSA",
			hash: {name: "SHA-256"}, 
		},
		publicKey as any, 
		signature, 
		newdata 
	);

	return result;
}

export const getPublicKeyEthAddress = async () => { 
	const publicCurve = await window.crypto.subtle.exportKey(
		"jwk",
		await lf.getItem("publicKey") as any
	);
	const longPublicKey = `04${publicCurve.x}${publicCurve.y}`;
	const hashedPublicKey = keccak256(longPublicKey).toString('hex');
	const ethAddress = `0x${hashedPublicKey.substring(hashedPublicKey.length -40)}`
	return ethAddress;
}