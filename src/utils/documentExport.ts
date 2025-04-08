
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, BorderStyle } from "docx";
import { QuizQuestion } from "@/types/quiz";
import { saveAs } from "file-saver";

export const exportToDocx = async (
  questions: QuizQuestion[],
  title: string,
  withAnswers: boolean = false
) => {
  // Create a new document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24 // 12pt font
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing
              before: 120, // 6pt spacing before
              after: 120 // 6pt spacing after
            }
          }
        }
      }
    }
  });

  // Add title
  doc.addSection({
    children: [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      }),
      
      // Generate questions
      ...questions.flatMap((question, index) => {
        const questionNumber = index + 1;
        const paragraphs = [];

        // Question text
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${questionNumber}. `,
                bold: true,
              }),
              new TextRun(question.question),
            ],
            spacing: {
              after: 200,
            },
          })
        );

        // Options for multiple choice questions
        if (question.type === "multiple_choice" && question.options) {
          question.options.forEach((option, optIndex) => {
            const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D...
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun(`${optionLetter}. ${option}`),
                ],
                indent: {
                  left: 720, // 0.5 inch indent
                },
                spacing: {
                  after: 120,
                },
              })
            );
          });
        }

        // Add answer section if requested
        if (withAnswers) {
          paragraphs.push(
            new Paragraph({
              text: "", // Empty spacing paragraph
              spacing: { after: 120 },
            })
          );

          if (question.type === "multiple_choice") {
            const correctOption = String.fromCharCode(65 + (question.correctAnswer as number));
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Answer: ${correctOption}`,
                    bold: true,
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          } else {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Answer: ${question.correctAnswer}`,
                    bold: true,
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          }

          // Add explanation if available
          if (question.explanation) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Explanation: ",
                    bold: true,
                  }),
                  new TextRun(question.explanation),
                ],
                spacing: { after: 240 },
              })
            );
          }
        }

        // Add spacing between questions
        paragraphs.push(
          new Paragraph({
            text: "",
            spacing: { after: 240 },
          })
        );

        return paragraphs;
      }),
    ],
  });

  // Generate and download the document
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)}_quiz.docx`);
};
