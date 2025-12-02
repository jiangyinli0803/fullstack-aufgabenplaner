import json
from django.core.management.base import BaseCommand
from api.models import Task, Employee, Comment

class Command(BaseCommand): #创建一个命令类，必须叫 Command，继承 BaseCommand
    help = 'import Data from JSON files' # 帮助文本，当你运行 python manage.py help import_data 时会显示这段文字

    def add_arguments(self, parser): #定义命令参数: 用来定义命令接受什么参数
        parser.add_argument('json_file', type=str, help='json file pfade') #定义第一个必需参数, ohne--，就是 JSON 文件的路径
        parser.add_argument('--model', type=str, help='models: task, employee, comment')#定义一个可选参数 --model

    def handle(self, *args, **kwargs): #主处理逻辑:是命令的主要执行逻辑，当你运行命令时，这个方法会被调用
        json_file= kwargs['json_file'] #获取用户输入的文件路径参数
        model_name = kwargs.get('model', '').lower() #获取 --model 参数，如果用户没提供，默认为空字符串

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f) #将 JSON 文件内容解析成 Python 数据结构

            if model_name == 'employee' or 'employees' in json_file.lower():
                self.import_employees(data)
            elif model_name == 'task' or 'tasks' in json_file.lower():
                self.import_tasks(data)
            elif model_name == 'comment' or 'comments' in json_file.lower():
                self.import_comments(data)

            else:
                self.stdout.write(self.style.WARNING('not expected models, trying to read...'))
                if isinstance(data, list) and len(data) > 0: #检查数据是否是列表
                    if 'department' in data[0]:
                        self.import_employees(data)
                    elif 'title' in data[0] and 'start_date' in data[0]:
                        self.import_tasks(data)
                    elif 'text' in data[0] and 'author' in data[0]:
                        self.import_comments(data)

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found {json_file}')) #文件未找到:
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR('Json format error')) #JSON 格式错误
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Import failed: {str(e)}')) #导入失败

    #导入员工数据的方法
    def import_employees(self, data):
        count = 0
        for item in data:
           employee, created = Employee.objects.get_or_create( #先查找是否已存在, 如果存在：返回这个员工, 如果不存在：创建新员工
                name=item['name'], #name 字段（必须存在，否则报错）
                defaults={
                    'department': item.get('department', ''), #defaults={} - 只在创建新记录时使用的字段,如果不存在则用空字符串
                }
            )
           if created:
              count += 1
        self.stdout.write(self.style.SUCCESS(f'successfully imported {count} employees')) 

    #导入task的方法
    def import_tasks(self, data):
        count = 0
        for item in data:
            task, created = Task.objects.get_or_create(
                title=item['title'],
                start_date=item['start_date'], #如果已存在同名且同开始日期的任务，就不重复创建
                defaults={
                    'description': item.get('description', ''),
                    'status': item.get('status', 'nicht_zugewiesen'),
                    'end_date': item.get('end_date', ''),
                    'color': item.get('color', '#edeff3'),
                    'employee_id': item.get('employee_id'),
                    'tester_id': item.get('tester_id'), #如果 JSON 中没有 tester_id 字段，返回 None
                    'version': item.get('version', 'v1.0'),
                }
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f'successfully imported {count} tasks'))

    #导入评论数据的方法
    def import_comments(self, data):
        count = 0
        for item in data:
            try:
                task = Task.objects.get(id=item['task_id']) #评论需要关联到任务，所以先查找任务
                comment = Comment.objects.create(
                    task=task,
                    text=item['text'],
                    author=item['author'],
                    author_id=item.get('author_id'),
                )
                count += 1
            except Task.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Task ID {item["task_id"]} not exists'))
        self.stdout.write(self.style.SUCCESS(f'successfully imported {count} comments'))