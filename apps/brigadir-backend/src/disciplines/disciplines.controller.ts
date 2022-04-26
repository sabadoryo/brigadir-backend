import { Controller, Get } from '@nestjs/common';
import { DisciplinesService } from './disciplines.service';

@Controller()
export class DisciplinesController {
  constructor(private disciplineService: DisciplinesService) {}

  @Get()
  getAllDisciplines() {
    const disciplines = this.disciplineService.getAllDisciplines();

    return disciplines;
  }
}
