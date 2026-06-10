with open('/Users/hakobjaghatspanyan/Projects/react-shop/components/dashboard/DashboardInspector.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for idx in range(5385, 5410):
    if idx < len(lines):
        print(f"{idx+1}: {repr(lines[idx])}")
