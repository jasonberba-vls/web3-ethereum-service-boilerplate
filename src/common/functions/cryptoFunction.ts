
import { InvalidNumberError } from 'web3';

function fromWei (number, numberOfZerosInDenomination) {
	// value in wei would always be integer
	// 13456789, 1234
	const value = String(toNumber(number));

	if (numberOfZerosInDenomination <= 0) {
		return value.toString();
	}

	// pad the value with required zeros
	// 13456789 -> 13456789, 1234 -> 001234
	const zeroPaddedValue = value.padStart(numberOfZerosInDenomination, '0');

	// get the integer part of value by counting number of zeros from start
	// 13456789 -> '13'
	// 001234 -> ''
	const integer = zeroPaddedValue.slice(0, -numberOfZerosInDenomination);

	// get the fraction part of value by counting number of zeros backward
	// 13456789 -> '456789'
	// 001234 -> '001234'
	const fraction = zeroPaddedValue.slice(-numberOfZerosInDenomination).replace(/\.?0+$/, '');

	if (integer === '') {
		return `0.${fraction}`;
	}

	if (fraction === '') {
		return integer;
	}

	return `${integer}.${fraction}`;
};

function toNumber (value) {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value === 'bigint') {
		return value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER
			? Number(value)
			: value;
	}

	try {
		return toNumber(BigInt(value));
	} catch {
		throw new InvalidNumberError(value);
	}
};

function toWei (number, numberOfZerosInDenomination) {
	// if value is decimal e.g. 24.56 extract `integer` and `fraction` part
	// to avoid `fraction` to be null use `concat` with empty string
	const [integer, fraction] = String(
		typeof number === 'string' && !isHexStrict(number) ? number : toNumber(number),
	)
		.split('.')
		.concat('');

	// join the value removing `.` from
	// 24.56 -> 2456
	const value = BigInt(`${integer}${fraction}`);

    var placeHolder = '1';
    const denomination = BigInt(placeHolder.padEnd(placeHolder.length + numberOfZerosInDenomination, '0'));

	// multiply value with denomination
	// 2456 * 1000000 -> 2456000000
	const updatedValue = value * denomination;

	// check which either `fraction` or `denomination` have lower number of zeros
	const decimals = Math.min(fraction.length, numberOfZerosInDenomination);

	if (decimals === 0) {
		return updatedValue.toString();
	}

	// Add zeros to make length equal to required decimal points
	// If string is larger than decimal points required then remove last zeros
	return updatedValue.toString().padStart(decimals, '0').slice(0, -decimals);
};

function isHexStrict (hex) {
	return (hex === 'string' && /^((-)?0x[0-9a-f]+|(0x))$/i.test(hex));
}

export {
    fromWei,
    toWei,
};
