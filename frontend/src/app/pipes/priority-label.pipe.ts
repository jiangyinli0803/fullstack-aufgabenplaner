import { Pipe, PipeTransform } from '@angular/core';

export interface PriorityDisplay {
  label: string;  
  color: string;  
}

@Pipe({
  name: 'priorityLabel',
  standalone: true
})

export class PriorityLabelPipe implements PipeTransform {
  private readonly priorityMap: Record<string, PriorityDisplay> = {
    'low': {
      label: 'Niedrig',
      color: 'bg-green-600'
    },
    'medium': {
      label: 'Mittel',
      color: 'bg-yellow-600'
    },
    'high': {
      label: 'Hoch',
      color: 'bg-orange-600'
    },
    'urgent': {
      label: 'Dringend',
      color: 'bg-red-600'
    }
  };

  transform(value: string | undefined | null): PriorityDisplay | undefined {
    if (!value) {
      return undefined; // 或者返回一个默认的 PriorityDisplay 对象
    }
       
    return this.priorityMap[value];
  }

}