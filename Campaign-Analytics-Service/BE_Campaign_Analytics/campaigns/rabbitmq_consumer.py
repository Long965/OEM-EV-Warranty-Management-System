import pika
import json
import time
from django.db import IntegrityError
from datetime import datetime

# Tên Host RabbitMQ (tên container)
RABBITMQ_HOST = 'rabbitmq_ms' 
QUEUE_NAME = 'warranty_claims_queue'
EXCHANGE_NAME = 'claims_exchange'
ROUTING_KEY = 'claim.approved'

def callback(ch, method, properties, body):
    """
    Hàm được gọi khi nhận được tin nhắn từ RabbitMQ.
    Ghi dữ liệu lỗi vào DB của MS 5.
    """
    # Import models tại đây để đảm bảo nó được nạp sau khi Django setup
    from campaigns.models import FaultData 
    
    try:
        data = json.loads(body)
        print(f" [x] Nhận tin nhắn: {data}")

        # Tạo bản ghi FaultData
        FaultData.objects.create(
            vin=data.get('vin'),
            faultCode=data.get('fault_code'),
            partName=data.get('part_name'),
            dateOccurred=datetime.now().date(),
            claimId=data.get('claim_id')
        )
        print(" [x] Đã xử lý và lưu vào FaultData thành công!")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        # Ghi logs chi tiết cho lỗi không xác định
        print(f" [!!!] LỖI LỚN XỬ LÝ: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag)


def start_consuming():
    print(' [*] Consumer đang khởi động và kết nối tới RabbitMQ...')
    
    # Logic thử kết nối lại (Retry Logic)
    for i in range(10): 
        try:
            # 1. Thiết lập kết nối RabbitMQ
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, port=5672, heartbeat=600))
            channel = connection.channel()
            print(" [*] Kết nối RabbitMQ thành công.")
            
            # 2. Khai báo Exchange, Queue, và Bind
            channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='direct', durable=True)
            result = channel.queue_declare(queue=QUEUE_NAME, durable=True)
            queue_name = result.method.queue
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name, routing_key=ROUTING_KEY)

            # 3. Bắt đầu lắng nghe
            print(f' [*] Consumer đang chờ tin nhắn. Mở Frontend và gửi Claim để kiểm tra.')
            channel.basic_consume(queue=queue_name, on_message_callback=callback)
            channel.start_consuming()
            break 
            
        except pika.exceptions.AMQPConnectionError as e:
            print(f" [!] Lỗi kết nối RabbitMQ. Thử lại sau 5s... Lần {i+1}/10")
            time.sleep(5)
        except Exception as e:
            print(f" [!!!] Lỗi khởi động Consumer: {e}")
            break
