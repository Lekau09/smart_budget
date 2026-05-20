export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+.[^\s@]+S/;
    return regex.test(email)
};

export const getInitials = (name) => {
    if (!name) return "";

    const words = name.split(" ");
    let initials = "";

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        initials += words[i][0];
    }

    return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
    if (num == null || isNaN(num)) return "";

    const [integerPart, fractonalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace (/\B(?=(\d{3})+(?!\d))/g, ",");

    return fractonalPart
        ?`${formattedInteger}.${fractonalPart}`
        : formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
    const chartData = data.map((item) => ({
        category: item?.category,
        amount: item?.amount,
    }));

    return chartData;
}