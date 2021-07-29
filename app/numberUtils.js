/**
 * @param {number} startValue
 * @param {number} endValue
 */
export function getPercent(startValue, endValue) {
	return (endValue / startValue) * 100
}

/**
 * @param {number} startValue
 * @param {number} endValue
 */
export function getPercentDiff(startValue, endValue) {
	const percent = getPercent(startValue, endValue)

	return percent - 100
}

/**
 * @param {number} startValue
 * @param {number} endValue
 * @param {number} percentMargin
 */
export function getIsOverPercentMargin(startValue, endValue, percentMargin) {
	const percentDiff = getPercentDiff(startValue, endValue)

	return percentDiff > percentMargin
}

/**
 * @param {number} value
 */
export function formatPrice(value) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

/**
 * @param {number} value
 */
export function formatPercent(value) {
	return new Intl.NumberFormat('en-US', {
		style: 'percent',
		maximumFractionDigits: 2,
	}).format(value / 100)
}
