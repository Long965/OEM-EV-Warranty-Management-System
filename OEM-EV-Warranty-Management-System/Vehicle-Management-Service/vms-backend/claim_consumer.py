import pika
import json
import time
import os

# Sử dụng tên service và thông tin đăng nhập đã cấu hình trong docker-compose.yml
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'rabbitmq') 
RABBITMQ_USER = os.environ.get('RABBITMQ_USER', 'user')
RABBITMQ_PASS = os.environ.get('RABBITMQ_PASS', 'password')
EXCHANGE_NAME = 'vehicle_events'
QUEUE_NAME = 'claim_service_queue' # Tên Queue riêng của Claim Service

def callback(ch, method, properties, body):
    """ Hàm được gọi khi nhận được tin nhắn """
    try:
        event = json.loads(body)
        print(" [x] CLAIM SERVICE: Received event.")
        
        # 1. Xử lý Sự kiện
        if event.get('event') == 'VEHICLE_REGISTERED':
            vin = event['data']['vin']
            model = event['data']['model_code']
            customer_id = event['data']['customer_id']
            
            # 2. LOGIC NGHIỆP VỤ CỦA CLAIM SERVICE:
            print(f" [*] Processing new vehicle registration: {vin}")
            print(f"  -> Action: Creating initial warranty record for VIN: {vin}")
            print(f"  -> Warranty Start Date: {event['data']['registered_at']}")
            # Ở đây, Claim Service sẽ gọi API của chính nó để tạo một đối tượng Claim/Warranty Record
            
        else:
            print(f" [!] Unknown event type received: {event.get('event')}")
            
        # Xác nhận đã xử lý tin nhắn
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except json.JSONDecodeError:
        print(" [!] Failed to decode JSON message.")
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False) # Loại bỏ tin nhắn lỗi
    except Exception as e:
        print(f" [!] Error during processing: {e}")


def consume_events():
    """ Kết nối và bắt đầu lắng nghe RabbitMQ """
    print(' [*] Waiting for messages. To exit press CTRL+C')
    while True:
        try:
            # Thiết lập kết nối
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST, 
                    port=5672, 
                    credentials=credentials, 
                    heartbeat=30
                )
            )
            channel = connection.channel()

            # Khai báo Exchange (đảm bảo nó tồn tại)
            channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='fanout')

            # Khai báo Queue và bind nó với Exchange
            # exclusive=True: Queue chỉ tồn tại cho đến khi Consumer kết nối
            result = channel.queue_declare(queue=QUEUE_NAME, exclusive=False)
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME)

            # Bắt đầu tiêu thụ tin nhắn
            channel.basic_consume(
                queue=QUEUE_NAME, 
                on_message_callback=callback, 
                auto_ack=False # Tắt auto-ack để đảm bảo xử lý xong mới xác nhận
            )
            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError as e:
            print(f" [!] Connection error to RabbitMQ: {e}. Retrying in 5 seconds...")
            time.sleep(5)
        except KeyboardInterrupt:
            print("Consumer stopped.")
            break
        except Exception as e:
            print(f" [!] Unexpected error: {e}")
            time.sleep(5)

if __name__ == '__main__':
    consume_events()