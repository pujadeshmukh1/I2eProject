const workbook = new ExcelJS.Workbook(); //creatting new excel workbook

//To create Interview Round details container
function createInterviewRoundComponent(
    roundName,
    interviewer,
    dateTime,
    totalScore
) {
    const html = `
        <div class="interview-round-details-container">
          <h3 class="title">${roundName}</h3>
          <div class="row">
            <div class="col w-25">
              <div class="field-label">Interviewer</div>
              <div class="field-data">${interviewer}</div>
            </div>
            <div class="col w-25">
              <div class="field-label">Date & Time</div>
              <div class="field-data">${dateTime}</div>
            </div>
            <div class="col w-25">
              <div class="field-label">Total Score</div>
              <div class="field-data">${totalScore}</div>
            </div>
            <div class="col w-25">
              <div class="field-label"></div>
              <div class="field-data"></div>
            </div>
          </div>
        </div>
      `;

    return html;
}

//To create Questions container 
function createRatingComponent(question, rating1, review) {
    const html = `
        <div class="row px-2">
          <div class="col-md-3 py-3">
            <span class="qtn-clr">${question}</span>
          </div>
          <div class="col-md-3 py-3">
            <input type="text" class="form-control" value="${rating1}" disabled />
          </div>
          <div class="col-md-3 py-3">
            <input type="text" class="form-control" value="${review}" disabled />
          </div>
          <div class="col-md-3 py-3"></div>
        </div>
      `;

    return html;
}

//To Format date using Moment.js
function formatDate(rawDate) {
    const formattedDate = moment(rawDate).format('DD MMM YYYY');
    console.log("Raw Date:", rawDate);
    console.log("Formatted Date:", formattedDate);
    return formattedDate;
}

//To fill candidate details section
function displayCandidateInfo(interviewRoundDetails) {
    $("#candidateName").text(interviewRoundDetails[0].Title);
    $("#candidateResumeId").text(interviewRoundDetails[0].CandidateResumeId);
    $("#positionAppliedFor").text(interviewRoundDetails[0].PositionAppliedFor);
    $("#practice").text(interviewRoundDetails[0].Practice.Title);
}

//To set column widths of a worksheet dynamically
function setColumnWidth(worksheet) {
    worksheet.columns.forEach(function (column) {
        var dataMax = 0;
        column.eachCell({ includeEmpty: true }, function (cell) {
            if (cell.value) { // Check if cell.value is not null or undefined
                var columnLength = cell.value.toString().length; // Convert value to string and get its length
                if (columnLength > dataMax) {
                    dataMax = columnLength;
                }
            }
        });
        column.width = dataMax < 15 ? 15 : dataMax;
    });
}

//To align data in columns center
function alignWorksheetData(worksheet) {
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
    });
}

//To check null values and return 0 for score
function handleNullScore(score) {
    if (score === null) {
        return 0;
    } else {
        return score;
    }
}

//To add question rows to the worksheet
function addQuestionRow(worksheet, question, round, firstRow) {
    let questionRow;

    if (firstRow) {
        questionRow = {
            candidateResumeId: round.CandidateResumeId,
            candidateName: round.Title,
            dateTime: formatDate(round.DateAndTime),
            practice: round.Practice.Title,
            interviewer: round.Interviewer.Title,
            totalScore: round.Tech_x0020_Score,
            question: question.Title,
            score: question.Score,
            remarks: question.Remarks
        };
        worksheet.addRow(questionRow);
        return firstRow = false;
    } else {
        questionRow = {
            candidateResumeId: "",
            candidateName: "",
            dateTime: "",
            practice: "",
            interviewer: "",
            totalScore: "",
            question: question.Title,
            score: question.Score,
            remarks: question.Remarks
        };
        worksheet.addRow(questionRow);
    }


}

//To fetch api data and update html
async function fetchData(CId) {
    try {
        const interviewRoundContainer = $("#interview-round-container");
        const RoundDetailsApiCall =
            `https://i2ec.sharepoint.com/sites/IAD-dev/_api/web/lists/getbytitle('CandidateFeedbackList')/items?$select=Title,Interviewer/Title,ID,InterviewType,DateAndTime,Tech_x0020_Score,CandidateResumeId,Practice/Title,PositionAppliedFor&$expand=Interviewer,Practice&$filter=CandidateResumeId eq ${CId}&$orderby=ID asc`;

        // heading row for the worksheet    
        const headingRow = {
            candidateResumeId: "Candidate Resume Id",
            candidateName: "Candidate Name",
            dateTime: "Date of Interview",
            practice: "Practice",
            interviewer: "Interviewer",
            totalScore: "Total Score",
            question: "Question",
            score: "Question Score",
            remarks: "Remarks",
        }

        try {
            const RoundDetailsData = await getData(RoundDetailsApiCall);
            const interviewTypeCounts = {};
            let eligibilityMessage;
            const interviewRoundDetails = RoundDetailsData.d.results;
            //console.log(interviewRoundDetails)
            displayCandidateInfo(interviewRoundDetails)

            for (const round of interviewRoundDetails) {
                const roundContainer = $("<div>").addClass(
                    "interview-round-details-container btm-cont-bdr"
                );
                let firstRow = true;
                const interviewType = round.InterviewType;
                const interviewer = round.Interviewer.Title;
                const dateTime = formatDate(round.DateAndTime)
                const totalScore = handleNullScore(round.Tech_x0020_Score);
                const QId = round.ID;

                //To generate Interview Round Name dynamically
                interviewTypeCounts[interviewType] =
                    interviewTypeCounts[interviewType] || 1;
                const roundName = `${interviewType} ${interviewTypeCounts[interviewType]}`
                    
                //To create Worksheet for each round
                const worksheet = workbook.addWorksheet(`${roundName}`);
                worksheet.columns = [
                    { Header: "Candidate Resume Id", key: "candidateResumeId" },
                    { Header: "CandidateName", key: "candidateName" },
                    { Header: "Date Of Interview", key: "dateTime" },
                    { Header: "Practice", key: "practice" },
                    { Header: "Interviewer", key: "interviewer" },
                    { Header: "Total Score", key: "totalScore" },
                    { Header: "Questions", key: "question" },
                    { Header: "Score", key: "score" },
                    { Header: "Remarks", key: "remarks" },
                ];

                //Adding heading rows of the worksheet 
                const note = ""
                const noteRow = worksheet.addRow([note]);
                const headerRow = worksheet.addRow(headingRow);

                //Styling header row 
                headerRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FF00C6B4" },
                    };
                    cell.font = {
                        color: { argb: "FFFFFFFF" },
                        bold: true
                    };
                });

                //Creating interview round details component and appending to round container
                const roundComponent = createInterviewRoundComponent(
                    roundName,
                    interviewer,
                    dateTime,
                    totalScore
                );
                roundContainer.append(roundComponent);

                try {
                    const QuestionListApiCall = `https://i2ec.sharepoint.com/sites/IAD-dev/_api/web/lists/getbytitle('QuestionsList')/items?$select=Title,Remarks,Score,CandidateID/Id&$expand=CandidateID&$filter=CandidateID eq ${QId}`;
                    const questionsData = await getData(QuestionListApiCall);
                    const questionsForRound = []; // Array to collect components


                    if (questionsData.d.results.length === 0) {
                        // Display message when no questions are available
                        const noFeedbackMessage = `
            <div class="no-feedback-message">
                Feedback for this round isn't submitted yet.
            </div>
        `;
                        roundContainer.append(noFeedbackMessage);
                        // Add candidate details row
                        const candidateDetailsRow = {
                            candidateResumeId: round.CandidateResumeId,
                            candidateName: round.Title,
                            dateTime: formatDate(round.DateAndTime),
                            practice: round.Practice.Title,
                            interviewer: round.Interviewer.Title,
                            totalScore: handleNullScore(round.Tech_x0020_Score)
                        };

                        worksheet.addRow(candidateDetailsRow);
                        eligibilityMessage = "Feedback not submitted";
                    } else {
                        questionsData.d.results.forEach((question) => {
                            //creating Rating component for each question
                            const ratingComponent = createRatingComponent(
                                question.Title,
                                question.Score,
                                question.Remarks
                            );

                            firstRow = addQuestionRow(worksheet, question, round, firstRow);
                            // Add component to the array
                            questionsForRound.push(ratingComponent);
                        });

                        // Calculate required score for shortlisting
                        const numberOfQuestions = questionsData.d.results.length;
                        const marksPerQuestion = 4;
                        const totalMarksForRound = numberOfQuestions * marksPerQuestion;
                        const requiredScore = (totalMarksForRound * 0.6).toFixed(1);

                        // Determine eligibility message
                        (round.Tech_x0020_Score >= requiredScore)
                            ? eligibilityMessage = `Minimum selection criteria is 60%. Score of ${round.Tech_x0020_Score}/${totalMarksForRound} required to shortlist the candidate.`
                            : eligibilityMessage = `Minimum selection criteria is 60%. Score of ${round.Tech_x0020_Score}/${totalMarksForRound} is not eligible to shortlist the candidate.`;

                        roundContainer.append(questionsForRound.join(""));
                    }
                } catch (error) {
                    console.log("Failed to retrieve Question details api data:", error);
                }
                interviewRoundContainer.append(roundContainer);

                //Incrementing particular Interview type count in interviewTypeCounts
                interviewTypeCounts[interviewType]++;

                //Dynamically setting column widths 
                setColumnWidth(worksheet);

                // Adding row to display eligibility message 
                const eligibilityMessageRow = worksheet.addRow(['', '', '', '', '', '', 'eligibility Message', '', '']);

                // Merge and updating the cells for eligibility message
                worksheet.mergeCells(`G${eligibilityMessageRow.number}:H${eligibilityMessageRow.number}`); // Merge from G to H columns


                //styling eligibility message row
                eligibilityMessageRow.font = { bold: true };
                const eligibilityMessageCell = eligibilityMessageRow.getCell(7);
                eligibilityMessageCell.value = eligibilityMessage
                eligibilityMessageCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFF7DC6F" },
                }

                // Merge the cells in the note row
                worksheet.mergeCells(`A1:${worksheet.getColumn(worksheet.columnCount).letter}1`);

                // Get the first cell in the note row
                const noteCell = noteRow.getCell(1);
                noteCell.value = "Note - Rate the candidate on a scale of ( 1-4 ) where is 1 is Below Average, 2 - Average, 3- Good, 4-Very Good"

                // Style the note cell
                noteCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFFFFF00" }, // Fill color for font
                };
                noteCell.font = { bold: true };

                //Aligning data in worksheet from center
                alignWorksheetData(worksheet);

                //setting header rows more height than others
                noteRow.height = 30;
                headerRow.height = 40;
                eligibilityMessageRow.height = 40;
            }

            console.log("Round Details Api Call", RoundDetailsData.d.results);
        } catch (error) {
            console.log("Failed to retrieve API data in roundetails", error);
        }

    } catch (error) {
        console.log(
            "Failed to retrieve API data in fetchData",
            error
        );
    }
}


async function exportToExcel() {
    try {
        const candidateName = $("#candidateName").text();
        const fileName = `candidateDetails_${candidateName}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), fileName);
    } catch (error) {
        console.error("Error exporting to Excel:", error);
    }
}

$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const CId = urlParams.get('candidateId');
    fetchData(CId);
    $("#export-btn").click(function (event) {
        event.preventDefault();
        exportToExcel();
    });
});