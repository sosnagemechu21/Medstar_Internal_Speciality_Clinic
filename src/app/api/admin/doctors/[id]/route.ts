import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSessionDoctor } from '@/lib/doctor-session';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await resolveSessionDoctor(request);
    if (!session.ok || session.ctx.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id: doctorId } = await params;
    const body = await request.json();
    const {
      firstNameEn,
      lastNameEn,
      firstNameAm,
      lastNameAm,
      specialtyName,
      experienceYears,
      bioEn,
      bioAm,
      photoDataUrl,
    } = body;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
    }

    let specialtyId = doctor.specialtyId;
    if (typeof specialtyName === 'string' && specialtyName.trim()) {
      const normalizedSpecialtyName = specialtyName.trim();
      let specialty = await prisma.specialty.findFirst({
        where: {
          nameEn: { equals: normalizedSpecialtyName, mode: 'insensitive' },
        },
      });

      if (!specialty) {
        specialty = await prisma.specialty.create({
          data: {
            nameEn: normalizedSpecialtyName,
            nameAm: normalizedSpecialtyName,
          },
        });
      }
      specialtyId = specialty.id;
    }

    const updated = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        firstNameEn: firstNameEn ?? doctor.firstNameEn,
        lastNameEn: lastNameEn ?? doctor.lastNameEn,
        firstNameAm: firstNameAm ?? doctor.firstNameAm,
        lastNameAm: lastNameAm ?? doctor.lastNameAm,
        specialtyId,
        experienceYears: typeof experienceYears !== 'undefined' ? Number(experienceYears) : doctor.experienceYears,
        bioEn: bioEn ?? doctor.bioEn,
        bioAm: bioAm ?? doctor.bioAm,
        ...(photoDataUrl ? { photoUrl: photoDataUrl } : {}),
      },
      include: {
        specialty: true,
      },
    });

    return NextResponse.json({ success: true, doctor: updated });
  } catch (error: any) {
    console.error('Admin doctor PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await resolveSessionDoctor(request);
    if (!session.ok || session.ctx.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id: doctorId } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, userId: true },
    });

    if (!doctor) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.timeSlot.deleteMany({ where: { doctorId } });
      await tx.doctorSchedule.deleteMany({ where: { doctorId } });
      await tx.appointment.deleteMany({ where: { doctorId } });
      await tx.doctor.delete({ where: { id: doctorId } });
      if (doctor.userId) {
        await tx.user.delete({ where: { id: doctor.userId } }).catch(() => {});
      }
    });

    return NextResponse.json({ success: true, message: 'Doctor profile removed successfully' });
  } catch (error: any) {
    console.error('Admin doctor DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
