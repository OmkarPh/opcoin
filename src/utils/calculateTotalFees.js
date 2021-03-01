function calculateTotalFees(transactions){
    let totalFees = 0;
    for(let tx of transactions)
        totalFees += tx.fee;
    return totalFees;
}
export default calculateTotalFees;