import { PrismaClient, EnrolmentStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Optional: clear existing data
  await prisma.payment.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.student.deleteMany();

  const programmes = [
    "BSc Computer Science",
    "BSc Software Engineering",
    "BSc Data Science",
    "BSc Cyber Security",
  ];

  // ------------------------
  // Create Students
  // ------------------------
  const students = [];

  for (let i = 0; i < 5; i++) {
    const student = await prisma.student.create({
      data: {
        studentId: `SMS-2025-${String(i + 1).padStart(4, "0")}`,
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        dateOfBirth: faker.date.birthdate({
          min: 18,
          max: 30,
          mode: "age",
        }),
        programme: faker.helpers.arrayElement(programmes),
        academicYear: "2024/2025",
        enrolmentStatus: faker.helpers.arrayElement([
          EnrolmentStatus.ENROLLED,
          EnrolmentStatus.ENROLLED,
          EnrolmentStatus.ENROLLED,
          EnrolmentStatus.DEFERRED,
          EnrolmentStatus.WITHDRAWN,
          EnrolmentStatus.COMPLETED,
        ]),
      },
    });

    students.push(student);
  }

  // ------------------------
  // Create Assessments
  // ------------------------
  const assessmentTitles = [
    "Software Engineering Project",
    "Data Structures Assignment",
    "Machine Learning Lab",
    "Database Systems Exam",
    "Cyber Security Report",
  ];

  const assessments = [];

  for (const title of assessmentTitles) {
    const deadline = faker.date.soon({ days: 180 });

    const assessment = await prisma.assessment.create({
      data: {
        title,
        module: title.split(" ").slice(0, 2).join(" "),
        deadline,
      },
    });

    assessments.push(assessment);
  }

  // ------------------------
  // Create Fees & Payments
  // ------------------------
  for (const student of students) {
    const amount = faker.number.float({
      min: 5000,
      max: 10000,
      fractionDigits: 2,
    });

    const paidAmount = faker.number.float({
      min: 0,
      max: amount,
      fractionDigits: 2,
    });

    const fee = await prisma.fee.create({
      data: {
        studentId: student.id,
        amount,
        paidAmount,
      },
    });

    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          feeId: fee.id,
          amount: paidAmount,
          reference: `PAY-${faker.string.alphanumeric(6).toUpperCase()}`,
          paymentDate: faker.date.recent({
            days: 30,
          }),
        },
      });
    }
  }

  // ------------------------
  // Create Submissions
  // ------------------------
  for (const student of students) {
    for (const assessment of assessments) {
      if (Math.random() > 0.5) continue;

      const isLate = Math.random() > 0.7;

      const submittedAt = new Date(assessment.deadline);

      if (isLate) {
        submittedAt.setDate(
          submittedAt.getDate() +
            faker.number.int({
              min: 1,
              max: 14,
            })
        );
      } else {
        submittedAt.setDate(
          submittedAt.getDate() -
            faker.number.int({
              min: 1,
              max: 14,
            })
        );
      }

      await prisma.submission.create({
        data: {
          studentId: student.id,
          assessmentId: assessment.id,
          fileUrl: `https://example.com/uploads/${student.studentId}-${assessment.id}.pdf`,
          submittedAt,
          isLate,
          isResubmission: false,
        },
      });
    }
  }

  // ------------------------
  // Create Marks
  // ------------------------
  for (const student of students) {
    for (const assessment of assessments) {
      if (Math.random() > 0.5) continue;

      const grade = faker.number.float({
        min: 0,
        max: 100,
        fractionDigits: 2,
      });

      let classification: string | null = null;

      if (grade >= 70) {
        classification = "Distinction";
      } else if (grade >= 60) {
        classification = "Merit";
      } else if (grade >= 40) {
        classification = "Pass";
      }

      await prisma.mark.create({
        data: {
          studentId: student.id,
          assessmentId: assessment.id,
          grade,
          classification,
          isPublished: Math.random() > 0.3,
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });