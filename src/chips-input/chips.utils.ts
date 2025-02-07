export const isQuotesClosed = (value: string) => (value.match(/"/g) || []).length % 2 === 0;

export const createChips = (input = '') => {
    const chipsArr = input.split(',');
    let quotePosition = [];

    for (let i = 0; i < chipsArr.length; i++) {
        if (chipsArr[i].search('"') > -1 && (chipsArr[i].match(/"/g) || []).length % 2 > 0) {
            quotePosition.push(i);
        }
        if (quotePosition.length > 1 || (quotePosition.length === 1 && i === chipsArr.length - 1)) {
            const firstQuote = quotePosition[0];
            const secondQuote = quotePosition[1] ? quotePosition[1] : chipsArr.length - 1;

            const slicedElems = chipsArr.slice(firstQuote, secondQuote + 1).join(',');

            chipsArr.splice(firstQuote, secondQuote - firstQuote + 1, slicedElems);
            i = firstQuote;
            quotePosition = [];
        }
    }
    return chipsArr;
};
